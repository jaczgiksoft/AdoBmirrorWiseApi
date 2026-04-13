const PatientNote = require('../../models/mysql/patient_note.model');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');
const User = require('../../models/mysql/user.model');
const Employee = require('../../models/mysql/employee.model');
const Position = require('../../models/mysql/position.model');

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

    // 🔍 Buscar nota por ID y tenant
    async findById(id, tenantId) {
        return PatientNote.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username'],
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
                            include: [
                                { model: Position, as: 'positions', attributes: ['id', 'name'], through: { attributes: [] } }
                            ]
                        }
                    ]
                }
            ]
        });
    }

    // 📋 Obtener todas las notas de un paciente
    async findByPatientId(patientId, tenantId) {
        return PatientNote.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username'],
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
                            include: [
                                { model: Position, as: 'positions', attributes: ['id', 'name'], through: { attributes: [] } }
                            ]
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
}

module.exports = new PatientNoteRepository();
