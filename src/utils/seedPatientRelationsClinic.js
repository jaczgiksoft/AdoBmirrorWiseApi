const Tenant = require('../models/mysql/tenant.model');
const Referral = require('../models/mysql/referral.model');
const Occupation = require('../models/mysql/occupation.model');
const PatientType = require('../models/mysql/patient_type.model');
const PatientStatus = require('../models/mysql/patient_status.model');
const BracketType = require('../models/mysql/bracket_type.model');
const PatientProfession = require('../models/mysql/patient_profession.model');
const { logger } = require('./logger');

const seedPatientRelationsClinic = async () => {
    try {
        const tenants = await Tenant.findAll({ where: { status: 'active' } });

        for (const tenant of tenants) {
            logger.info(`🦷 Inicializando catálogos clínicos para: ${tenant.name}`);

            // =========================
            // 🔹 Referral (fuente de referencia)
            // =========================
            const referrals = [
                { name: 'Facebook', tenant_id: tenant.id },
                { name: 'Instagram', tenant_id: tenant.id },
                { name: 'Recomendación', tenant_id: tenant.id },
                { name: 'Google Ads', tenant_id: tenant.id },
                { name: 'Otro', tenant_id: tenant.id }
            ];
            for (const r of referrals) {
                await Referral.findOrCreate({ where: { name: r.name, tenant_id: tenant.id }, defaults: r });
            }

            // =========================
            // 💼 Occupation (ocupaciones comunes)
            // =========================
            const occupations = [
                { name: 'Estudiante', tenant_id: tenant.id },
                { name: 'Empleado de oficina', tenant_id: tenant.id },
                { name: 'Docente', tenant_id: tenant.id },
                { name: 'Independiente', tenant_id: tenant.id },
                { name: 'Ama de casa', tenant_id: tenant.id },
                { name: 'Otro', tenant_id: tenant.id }
            ];
            for (const o of occupations) {
                await Occupation.findOrCreate({ where: { name: o.name, tenant_id: tenant.id }, defaults: o });
            }

            // =========================
            // 👤 Patient Type
            // =========================
            const types = [
                { name: 'Nuevo', color: '#2196F3', tenant_id: tenant.id },
                { name: 'En tratamiento', color: '#4CAF50', tenant_id: tenant.id },
                { name: 'Control', color: '#FFC107', tenant_id: tenant.id },
                { name: 'Referido', color: '#9C27B0', tenant_id: tenant.id }
            ];
            for (const t of types) {
                await PatientType.findOrCreate({ where: { name: t.name, tenant_id: tenant.id }, defaults: t });
            }

            // =========================
            // ⚕️ Patient Status
            // =========================
            const statuses = [
                { name: 'Fase I', color: '#F57C00', tenant_id: tenant.id },
                { name: 'Fase II', color: '#FBC02D', tenant_id: tenant.id },
                { name: 'Retenedor', color: '#7B1FA2', tenant_id: tenant.id },
                { name: 'Alta', color: '#388E3C', tenant_id: tenant.id }
            ];
            for (const s of statuses) {
                await PatientStatus.findOrCreate({ where: { name: s.name, tenant_id: tenant.id }, defaults: s });
            }

            // =========================
            // 🦷 Bracket Type
            // =========================
            const bracketTypes = [
                { name: 'Metálico', color: '#607D8B', tenant_id: tenant.id },
                { name: 'Cerámico', color: '#B0BEC5', tenant_id: tenant.id },
                { name: 'Autoligado', color: '#9E9E9E', tenant_id: tenant.id },
                { name: 'Zafiro', color: '#E1F5FE', tenant_id: tenant.id }
            ];
            for (const b of bracketTypes) {
                await BracketType.findOrCreate({ where: { name: b.name, tenant_id: tenant.id }, defaults: b });
            }

            // =========================
            // 🎓 Patient Profession (títulos)
            // =========================
            const professions = [
                { name: 'Licenciado', abbreviation: 'Lic.', color: '#E0E0E0', tenant_id: tenant.id },
                { name: 'Doctor', abbreviation: 'Dr.', color: '#90CAF9', tenant_id: tenant.id },
                { name: 'Cirujano Dentista', abbreviation: 'C.D.', color: '#80CBC4', tenant_id: tenant.id },
                { name: 'Maestro', abbreviation: 'Mtro.', color: '#FFCC80', tenant_id: tenant.id }
            ];
            for (const p of professions) {
                await PatientProfession.findOrCreate({ where: { name: p.name, tenant_id: tenant.id }, defaults: p });
            }

            logger.info(`✅ Catálogos clínicos inicializados para ${tenant.name}`);
        }

        logger.info('🎯 Seed de relaciones clínicas completado.');
    } catch (err) {
        logger.error(`❌ Error en seedPatientRelationsClinic: ${err.message}`);
    }
};

module.exports = seedPatientRelationsClinic;
