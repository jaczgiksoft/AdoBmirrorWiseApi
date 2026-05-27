// src/services/push.service.js
const admin = require('../config/firebase.config');

class PushService {
    /**
     * Envía una notificación push a un dispositivo específico usando su Token de FCM
     * @param {string} deviceToken - El token FCM del dispositivo del paciente
     * @param {string} title - Título de la notificación
     * @param {string} message - Cuerpo de la notificación
     * @param {object} payload - Datos extra en formato JSON (útil para redireccionar en la app móvil)
     */
    async sendPushNotification(deviceToken, title, message, payload = {}) {
        if (!deviceToken) {
            throw new Error('No se proporcionó un token de dispositivo válido.');
        }

        const messagingPayload = {
            token: deviceToken,
            notification: {
                title: title,
                body: message,
            },
            // La propiedad data es crucial para que la app móvil lea IDs de citas, tipos de alertas, etc.
            data: {
                ...payload,
                click_action: 'FLUTTER_NOTIFICATION_CLICK', // O la configuración que requiera tu app móvil
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'patient_alerts_channel' // Asegúrate de que coincida con el canal de tu app móvil
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };

        try {
            const response = await admin.messaging().send(messagingPayload);
            console.log('Notificación push enviada con éxito:', response);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('Error enviando notificación push a Firebase:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new PushService();