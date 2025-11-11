// src/modules/cashRegister/cashRegister.service.js
const sequelize = require("../../config/database");
const cashRegisterRepository = require("./cashRegister.repository");
const { createLog } = require("../../utils/log.helper");
const { notifyRoles } = require("../../utils/notify.helper");
const { logApiError } = require("../../utils/logApiError");
const { logger } = require("../../utils/logger");

class CashRegisterService {
    async getAll(currentUser) {
        return cashRegisterRepository.findAllByTenant(currentUser.tenant_id);
    }

    async getById(id, currentUser) {
        const cashRegister = await cashRegisterRepository.findById(id, currentUser.tenant_id);
        if (!cashRegister) throw new Error("Caja no encontrada");
        return cashRegister;
    }

    // 🔎 Buscar caja por código
    async getByCode(code, currentUser) {
        const cashRegister = await cashRegisterRepository.findByCode(code, currentUser.tenant_id);
        if (!cashRegister) throw new Error("Caja no encontrada");
        return cashRegister;
    }

    // 🟢 Crear caja
    async create(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const newCashRegister = await cashRegisterRepository.create(
                { ...data, tenant_id: currentUser.tenant_id },
                t
            );

            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: "create",
                module: "cashRegisters",
                description: `Caja creada: ${newCashRegister.name}`,
                ip: req.ip,
                user_agent: req.headers["user-agent"],
            });

            // 🔔 Notificación global (por roles)
            await notifyRoles({
                tenant_id: currentUser.tenant_id,
                event: "CASH_REGISTER_CREATED",
                title: "Nueva caja creada",
                message: `${currentUser.username} ha creado la caja ${newCashRegister.name}.`,
                link: `/cash-registers/${newCashRegister.id}`,
                actor: currentUser,
            });

            return newCashRegister;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear caja: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar caja
    async update(id, data, currentUser, req) {
        const cashRegister = await cashRegisterRepository.findById(id, currentUser.tenant_id);
        if (!cashRegister) throw new Error("Caja no encontrada");

        await cashRegisterRepository.update(cashRegister, data);

        // 🧾 Log
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: "update",
            module: "cashRegisters",
            description: `Caja actualizada: ${cashRegister.name}`,
            ip: req.ip,
            user_agent: req.headers["user-agent"],
        });

        // 🔔 Notificación global (por roles)
        await notifyRoles({
            tenant_id: currentUser.tenant_id,
            event: "CASH_REGISTER_UPDATED",
            title: "Caja actualizada",
            message: `${currentUser.username} actualizó la caja ${cashRegister.name}.`,
            link: `/cash-registers/${cashRegister.id}`,
            actor: currentUser,
        });

        return cashRegister;
    }

    // 🔴 Eliminar caja
    async delete(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const cashRegister = await cashRegisterRepository.findById(id, currentUser.tenant_id);
            if (!cashRegister) throw new Error("Caja no encontrada");

            await cashRegisterRepository.softDelete(cashRegister, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: "delete",
                module: "cashRegisters",
                description: `Caja eliminada: ${cashRegister.name}`,
                ip: req.ip,
                user_agent: req.headers["user-agent"],
            });

            // 🔔 Notificación global (por roles)
            await notifyRoles({
                tenant_id: currentUser.tenant_id,
                event: "CASH_REGISTER_DELETED",
                title: "Caja eliminada",
                message: `${currentUser.username} eliminó la caja ${cashRegister.name}.`,
                actor: currentUser,
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar caja: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🧮 Datatable
    async getDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        // ✅ aceptar ambos formatos
        const searchValue = body["search[value]"] || body.searchValue || "";

        const orderColumnIndex = body["order[0][column]"] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body["order[0][dir]"] || (body.order?.[0]?.dir ?? "asc")).toUpperCase();

        const columns = [null, "code", "name", "status", "id"];
        const orderColumn = columns[orderColumnIndex] || "id";

        const statusFilter = body.statusFilter || "";

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await cashRegisterRepository.datatable(params, currentUser.tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new CashRegisterService();
