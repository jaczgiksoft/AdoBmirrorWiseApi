const PatientConversation = require('../../models/mysql/patient_conversation.model');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');
const User = require('../../models/mysql/user.model');
const Employee = require('../../models/mysql/employee.model');
const Position = require('../../models/mysql/position.model');

class PatientConversationRepository {
    // 🟢 Crear conversación
    async createConversation(data, transaction) {
        return PatientConversation.create(data, { transaction });
    }

    // 🟡 Actualizar conversación
    async updateConversation(conversation, data, transaction) {
        return conversation.update(data, { transaction });
    }

    // 🔴 Eliminar conversación (borrado físico)
    async deleteConversation(conversation, transaction) {
        return conversation.destroy({ transaction, force: true });
    }

    // 🔍 Buscar conversación por ID y tenant
    async findById(id, tenantId) {
        return PatientConversation.findOne({
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

    // 📋 Obtener todas las conversaciones de un paciente
    async findByPatientId(patientId, tenantId) {
        return PatientConversation.findAll({
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

module.exports = new PatientConversationRepository();
