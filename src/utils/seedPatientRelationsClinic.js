// src/utils/seedPatientRelationsClinic.js
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

        if (!tenants.length) {
            logger.warn('⚠️ No se encontraron clínicas activas para inicializar catálogos clínicos.');
            return;
        }

        for (const tenant of tenants) {
            logger.info(`🦷 Inicializando catálogos clínicos para: ${tenant.name}`);

            // =========================
            // 🔹 Referral
            // =========================
            const referrals = [
                'Facebook',
                'Instagram',
                'Recomendación',
                'Paciente',
                'Google Ads',
                'Otro'
            ].map(name => ({ name, tenant_id: tenant.id }));

            // 💼 Occupations
            const occupations = [
                'Estudiante',
                'Empleado de oficina',
                'Docente',
                'Independiente',
                'Ama de casa',
                'Otro'
            ].map(name => ({ name, tenant_id: tenant.id }));

            // 👤 Patient Types
            const types = [
                { name: 'Nuevo', color: '#2196F3' },
                { name: 'Consulta única', color: '#A80B70' },
                { name: 'Activo', color: '#4CAF50' },
                { name: 'Control', color: '#FFC107' },
                { name: 'Referido', color: '#9C27B0' }
            ].map(t => ({ ...t, tenant_id: tenant.id }));

            // ⚕️ Patient Status
            const statuses = [
                { name: 'Fase I', color: '#F57C00' },
                { name: 'Fase II', color: '#FBC02D' },
                { name: 'Retenedor', color: '#7B1FA2' },
                { name: 'Alta', color: '#388E3C' }
            ].map(s => ({ ...s, tenant_id: tenant.id }));

            // 🦷 Bracket Types
            // 🦷 Bracket Types (colores mejorados)
            const bracketTypes = [
                { name: 'Standard',   color: '#546E7A' }, // Azul grisáceo elegante
                { name: 'Metálico',   color: '#90A4AE' }, // Gris acero moderno
                { name: 'Cerámico',   color: '#CFD8DC' }, // Gris claro porcelana
                { name: 'Autoligado', color: '#8D6E63' }, // Café suave premium
                { name: 'Zafiro',     color: '#81D4FA' }  // Azul zafiro suave
            ].map(b => ({ ...b, tenant_id: tenant.id }));

            // 🎓 Professions
            const professions = [
                { name: 'Licenciado', abbreviation: 'Lic.', color: '#E0E0E0' },
                { name: 'Doctor', abbreviation: 'Dr.', color: '#90CAF9' },
                { name: 'Cirujano Dentista', abbreviation: 'C.D.', color: '#80CBC4' },
                { name: 'Maestro', abbreviation: 'Mtro.', color: '#FFCC80' }
            ].map(p => ({ ...p, tenant_id: tenant.id }));

            // =========================
            // 🌱 Inserción concurrente optimizada
            // =========================
            await Promise.all([
                ...referrals.map(r => Referral.findOrCreate({ where: { name: r.name, tenant_id: r.tenant_id }, defaults: r })),
                ...occupations.map(o => Occupation.findOrCreate({ where: { name: o.name, tenant_id: o.tenant_id }, defaults: o })),
                ...types.map(t => PatientType.findOrCreate({ where: { name: t.name, tenant_id: t.tenant_id }, defaults: t })),
                ...statuses.map(s => PatientStatus.findOrCreate({ where: { name: s.name, tenant_id: s.tenant_id }, defaults: s })),
                ...bracketTypes.map(b => BracketType.findOrCreate({ where: { name: b.name, tenant_id: b.tenant_id }, defaults: b })),
                ...professions.map(p => PatientProfession.findOrCreate({ where: { name: p.name, tenant_id: p.tenant_id }, defaults: p }))
            ]);

            logger.info(`✅ Catálogos clínicos creados o actualizados para ${tenant.name}`);
        }

        logger.info('🎯 Seed de relaciones clínicas completado correctamente.');
    } catch (err) {
        logger.error(`❌ Error en seedPatientRelationsClinic: ${err.message}`, {
            stack: err.stack
        });
    }
};

module.exports = seedPatientRelationsClinic;
