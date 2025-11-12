const PatientNote = require('../../models/mysql/patient_note.model');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');
const User = require('../../models/mysql/user.model');

class PatientNoteRepository {
    // 🟢 Crear nota
    async createNote(data, transaction) {
        return PatientNote.create(data, { transaction });
    }

    // 🟡 Actualizar nota
    async updateNote(note, data, transaction) {
        return note.update(data, { transaction });
    }

    // 🔴 Eliminar nota (borrado físico)
    async deleteNote(note, transaction) {
        return note.destroy({ transaction, force: true });
    }

    // 🔍 Buscar nota por ID (según tenant)
    async findById(id, tenantId) {
        return PatientNote.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
                { model: User, as: 'author', attributes: ['id', 'username', 'email'] }
            ],
        });
    }

    // 📋 Obtener todas las notas de un paciente
    async findByPatientId(patientId, tenantId, includePrivate = false, currentUserId = null) {
        const where = { patient_id: patientId, tenant_id: tenantId };

        // Si no puede ver privadas, las filtramos
        if (!includePrivate) {
            where.is_private = false;
        } else if (includePrivate && currentUserId) {
            // Mostrar privadas solo si son del mismo autor
            where[Symbol.for('or')] = [
                { is_private: false },
                { user_id: currentUserId }
            ];
        }

        return PatientNote.findAll({
            where,
            include: [
                { model: User, as: 'author', attributes: ['id', 'username', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}

module.exports = new PatientNoteRepository();
