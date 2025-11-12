const sequelize = require('../../config/database');
const patientNoteRepository = require('./patient_note.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class PatientNoteService {
    // 🟢 Crear nueva nota
    async createPatientNote(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = [
                'tenant_id',
                'patient_id',
                'user_id',
                'title',
                'content',
                'is_private'
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;
            cleanData.user_id = currentUser.id; // el autor siempre será el usuario autenticado

            const newNote = await patientNoteRepository.createNote(cleanData, t);
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_notes',
                description: `Nota creada para paciente #${newNote.patient_id}: ${newNote.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación (solo si la nota no es privada)
            if (!newNote.is_private) {
                await notifyUser({
                    user_id: currentUser.id,
                    title: 'Nueva nota de paciente',
                    message: `${currentUser.username} agregó una nueva nota pública: "${newNote.title}".`,
                    type: 'info'
                });
            }

            return newNote;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear nota: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar nota existente
    async updatePatientNote(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const note = await patientNoteRepository.findById(id, currentUser.tenant_id);
            if (!note) throw new Error('Nota no encontrada');

            // Solo el autor o administradores pueden editar notas privadas
            if (note.is_private && note.user_id !== currentUser.id) {
                throw new Error('No tienes permiso para editar esta nota privada');
            }

            const allowedFields = ['title', 'content', 'is_private'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await patientNoteRepository.updateNote(note, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_notes',
                description: `Nota actualizada: ${note.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return note;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar nota: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar nota (borrado físico)
    async deletePatientNote(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const note = await patientNoteRepository.findById(id, currentUser.tenant_id);
            if (!note) throw new Error('Nota no encontrada');

            // Solo el autor puede eliminar su nota privada
            if (note.is_private && note.user_id !== currentUser.id) {
                throw new Error('No tienes permiso para eliminar esta nota privada');
            }

            await patientNoteRepository.deleteNote(note, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_notes',
                description: `Nota eliminada: ${note.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar nota: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todas las notas de un paciente
    async getNotesByPatientId(patientId, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        // Si el usuario no es admin, solo puede ver sus notas privadas
        const includePrivate = true;
        const currentUserId = currentUser.id;

        return await patientNoteRepository.findByPatientId(
            patientId,
            currentUser.tenant_id,
            includePrivate,
            currentUserId
        );
    }
}

module.exports = new PatientNoteService();
