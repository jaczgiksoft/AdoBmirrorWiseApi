// src/bootstrap/index.js
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const EmployeeChatParticipant = require("../models/mysql/employee_chat_participant.model");
const app = require("../app");
const sequelize = require("../config/database");
const connectMongo = require("../config/mongo");
const runSeeds = require("./seeds");
const { logger } = require("../utils/logger");

require("../models/mysql/associations");

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        // 🟢 Conexión SQL
        await sequelize.authenticate();
        logger.info(`🟢 ${process.env.DB_DIALECT?.toUpperCase() || "MYSQL"} conectado`);

        const syncMode = process.env.DB_SYNC_MODE || "none";
        if (process.env.NODE_ENV === "production" && syncMode !== "none") {
            logger.warn("⚠️ DB_SYNC_MODE ignorado en producción por seguridad");
        } else if (syncMode === "force") {
            logger.warn("⚠️ Sequelize SYNC con FORCE");
            await sequelize.sync({ force: true });
        } else if (syncMode === "alter") {
            logger.info("🔧 Sequelize SYNC con ALTER");
            await sequelize.sync({ alter: true });
        } else {
            logger.info("✅ Sequelize SYNC deshabilitado");
        }

        // 🌱 Seeders
        if (process.env.SEED_DB === "true" && process.env.NODE_ENV !== "production") {
            logger.info("🌱 Ejecutando seeders...");
            await runSeeds();
        }

        // 🍃 Conexión MongoDB
        await connectMongo();
        logger.info("🟢 MongoDB conectado");

        // 🚀 Iniciar servidor HTTP + WebSocket
        if (process.env.NODE_ENV !== "test") {
            const httpServer = http.createServer(app);

            // Inicializar Socket.IO
            const io = new Server(httpServer, {
                cors: {
                    origin: "*", // puedes restringirlo a tus dominios permitidos
                    methods: ["GET", "POST", "PUT", "DELETE"],
                },
            });


            // 🔐 Middleware de autenticación para Socket.IO
            io.use(async (socket, next) => {
                const token = socket.handshake.auth?.token;
                if (!token) {
                    return next(new Error("No autorizado: Falta token"));
                }
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    socket.user = decoded;
                    next();
                } catch (err) {
                    logger.error(`❌ Error de auth en Socket: ${err.message}`);
                    next(new Error("No autorizado: Token inválido"));
                }
            });

            // 🔌 Manejo de conexión
            io.on("connection", async (socket) => {
                const userId = socket.user.id;
                logger.info(`🧩 Cliente WebSocket conectado: ${socket.id} (User: ${userId})`);

                // 🏠 Unirse a sala personal (para notificaciones directas)
                socket.join(`user:${userId}`);

                // 💬 Unirse a todas las salas de chat donde participa
                try {
                    const chats = await EmployeeChatParticipant.findAll({
                        where: { user_id: userId },
                        attributes: ["chat_id"]
                    });
                    
                    chats.forEach(c => {
                        socket.join(`chat:${c.chat_id}`);
                    });
                    
                    logger.info(`✅ Usuario ${userId} unido a ${chats.length} salas de chat`);
                } catch (err) {
                    logger.error(`❌ Error al unir usuario ${userId} a salas: ${err.message}`);
                }

                socket.on("disconnect", () => {
                    logger.info(`🔌 Cliente desconectado: ${socket.id} (User: ${userId})`);
                });
            });

            // 📢 Guardar la instancia global (para usar desde otros módulos)
            global.io = io;
            module.exports.emitNotification = (notification) => {
                if (global.io) global.io.emit("notification:new", notification);
            };

            // Arrancar servidor
            httpServer.listen(PORT, () => {
                logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
                logger.info("📡 WebSocket listo y escuchando conexiones");
            });
        }

        // 🔻 Graceful shutdown
        const shutdown = async () => {
            logger.info("🛑 Apagando servidor...");
            await sequelize.close();
            logger.info(`🔌 ${process.env.DB_DIALECT?.toUpperCase() || "MYSQL"} desconectado`);
            process.exit(0);
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error) {
        logger.error(`❌ Error al iniciar: ${error.message}`);
        process.exit(1);
    }
}

module.exports = bootstrap;
