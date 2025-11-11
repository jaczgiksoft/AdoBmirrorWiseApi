const fs = require("fs");
const path = require("path");
const sequelize = require("../../config/database");
const storeRepository = require("./store.repository");
const { createLog } = require("../../utils/log.helper");
const { logApiError } = require("../../utils/logApiError");
const { logger } = require("../../utils/logger");
const { notifyRoles } = require("../../utils/notify.helper");

class StoreService {
    async getAllStores(currentUser) {
        return storeRepository.findAllByTenant(currentUser.tenant_id);
    }

    async getStoreById(id, currentUser) {
        const store = await storeRepository.findById(id, currentUser.tenant_id);
        if (!store) throw new Error("Tienda no encontrada");
        return store;
    }

    // 🟢 Crear tienda
    async createStore(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            // Validar código único
            if (await storeRepository.findByCode(data.code, currentUser.tenant_id)) {
                throw new Error("El código de la tienda ya está en uso");
            }

            const allowedFields = [
                "name",
                "code",
                "email",
                "phone",
                "address",
                "city",
                "state",
                "country",
                "postal_code",
                "tax_id",
                "legal_name",
                "regime",
                "certificate_path",
                "key_path",
                "certificate_password",
                "status",
                "timezone",
                "opening_hours",
                "currency",
                "exchange_rate",
                "profit_margin",
                "use_parent_config",
                "use_parent_tax_data",
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;
            cleanData.timezone = cleanData.timezone || "America/Hermosillo";
            cleanData.currency = cleanData.currency || "MXN";
            cleanData.use_parent_config = cleanData.use_parent_config ?? true;
            cleanData.use_parent_tax_data = cleanData.use_parent_tax_data ?? true;

            if (cleanData.profit_margin)
                cleanData.profit_margin = parseFloat(cleanData.profit_margin.toFixed(2));

            if (cleanData.exchange_rate)
                cleanData.exchange_rate = parseFloat(parseFloat(cleanData.exchange_rate).toFixed(4));

            // Crear registro
            const newStore = await storeRepository.createStore(cleanData, t);

            // 🖼️ Subir logo / banner (si existen)
            const { files } = req;
            if (files?.logo?.[0] || files?.banner?.[0]) {
                const tenantId = currentUser.tenant_id;
                const finalDir = path.join(__dirname, `../../../uploads/${tenantId}/stores/${newStore.id}`);
                fs.mkdirSync(finalDir, { recursive: true });

                const updates = {};
                if (files?.logo?.[0]) {
                    const tempPath = files.logo[0].path;
                    const newPath = path.join(finalDir, files.logo[0].filename);
                    fs.renameSync(tempPath, newPath);
                    updates.logo_url = `/uploads/${tenantId}/stores/${newStore.id}/${files.logo[0].filename}`;
                }
                if (files?.banner?.[0]) {
                    const tempPath = files.banner[0].path;
                    const newPath = path.join(finalDir, files.banner[0].filename);
                    fs.renameSync(tempPath, newPath);
                    updates.banner_url = `/uploads/${tenantId}/stores/${newStore.id}/${files.banner[0].filename}`;
                }

                await newStore.update(updates, { transaction: t });
            }

            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: "create",
                module: "stores",
                description: `Tienda creada: ${newStore.name}`,
                ip: req.ip,
                user_agent: req.headers["user-agent"],
            });

            // 🔔 Notificación global
            await notifyRoles({
                tenant_id: currentUser.tenant_id,
                event: "STORE_CREATED",
                title: "Nueva tienda creada",
                message: `${currentUser.username} ha creado la tienda ${newStore.name}.`,
                link: `/stores/${newStore.id}`,
                actor: currentUser,
            });

            return newStore;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear tienda: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar tienda
    async updateStore(id, data, currentUser, req) {
        const store = await storeRepository.findById(id, currentUser.tenant_id);
        if (!store) throw new Error("Tienda no encontrada");

        // Validar código único
        if (data.code && data.code !== store.code) {
            if (await storeRepository.findByCode(data.code, currentUser.tenant_id)) {
                throw new Error("El código ya está en uso en otra tienda");
            }
        }

        const allowedFields = [
            "name",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "country",
            "postal_code",
            "tax_id",
            "legal_name",
            "regime",
            "certificate_path",
            "key_path",
            "certificate_password",
            "status",
            "timezone",
            "opening_hours",
            "currency",
            "exchange_rate",
            "profit_margin",
            "use_parent_config",
            "use_parent_tax_data",
        ];

        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        if (cleanData.profit_margin)
            cleanData.profit_margin = parseFloat(parseFloat(cleanData.profit_margin).toFixed(2));

        if (cleanData.exchange_rate)
            cleanData.exchange_rate = parseFloat(parseFloat(cleanData.exchange_rate).toFixed(4));

        // 🖼️ Manejo de archivos (logo / banner)
        const { files } = req;
        const tenantId = currentUser.tenant_id;
        const finalDir = path.join(__dirname, `../../../uploads/${tenantId}/stores/${store.id}`);
        fs.mkdirSync(finalDir, { recursive: true });

        if (files?.logo?.[0]) {
            const tempPath = files.logo[0].path;
            const newPath = path.join(finalDir, files.logo[0].filename);
            fs.renameSync(tempPath, newPath);
            cleanData.logo_url = `/uploads/${tenantId}/stores/${store.id}/${files.logo[0].filename}`;
        }

        if (files?.banner?.[0]) {
            const tempPath = files.banner[0].path;
            const newPath = path.join(finalDir, files.banner[0].filename);
            fs.renameSync(tempPath, newPath);
            cleanData.banner_url = `/uploads/${tenantId}/stores/${store.id}/${files.banner[0].filename}`;
        }

        await storeRepository.updateStore(store, cleanData);

        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: "update",
            module: "stores",
            description: `Tienda actualizada: ${store.name}`,
            ip: req.ip,
            user_agent: req.headers["user-agent"],
        });

        await notifyRoles({
            tenant_id: currentUser.tenant_id,
            event: "STORE_UPDATED",
            title: "Tienda actualizada",
            message: `${currentUser.username} actualizó la información de la tienda ${store.name}.`,
            link: `/stores/${store.id}`,
            actor: currentUser,
        });

        return store;
    }

    // 🔴 Eliminar tienda
    async deleteStore(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const store = await storeRepository.findById(id, currentUser.tenant_id);
            if (!store) throw new Error("Tienda no encontrada");

            await storeRepository.softDeleteStore(store, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: "delete",
                module: "stores",
                description: `Tienda eliminada: ${store.name}`,
                ip: req.ip,
                user_agent: req.headers["user-agent"],
            });

            await notifyRoles({
                tenant_id: currentUser.tenant_id,
                event: "STORE_DELETED",
                title: "Tienda eliminada",
                message: `${currentUser.username} eliminó la tienda ${store.name}.`,
                actor: currentUser,
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar tienda: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📊 DataTable
    async getStoresDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body["search[value]"] || body.searchValue || "";
        const orderColumnIndex = body["order[0][column]"] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body["order[0][dir]"] || (body.order?.[0]?.dir ?? "asc")).toUpperCase();

        const columns = [null, "name", "code", "status", "id"];
        const orderColumn = columns[orderColumnIndex] || "id";

        const statusFilter = body.statusFilter || "";
        const city = body.city || "";
        const state = body.state || "";
        const currency = body.currency || "";

        const params = {
            start,
            length,
            searchValue,
            orderColumn,
            orderDir,
            statusFilter,
            city,
            state,
            currency,
        };

        const { recordsTotal, recordsFiltered, rows } = await storeRepository.datatable(
            params,
            currentUser.tenant_id
        );

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new StoreService();
