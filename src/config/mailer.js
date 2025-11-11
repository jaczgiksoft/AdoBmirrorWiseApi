// src/config/mailer.js
const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

const transporter = nodemailer.createTransport({
    host: "smtp.office365.com", // Microsoft 365
    port: 587,
    secure: false,              // STARTTLS
    auth: {
        user: process.env.MAIL_USER, // debe ser tu correo empresarial
        pass: process.env.MAIL_PASS  // App Password o contraseña real
    }
});

// Validación inicial
transporter.verify((error, success) => {
    if (error) {
        logger.error(`🔴 Error al conectar con servidor de correo: ${error.message}`);
    } else {
        logger.info('📧 Conexión SMTP lista para enviar correos');
    }
});

module.exports = transporter;
