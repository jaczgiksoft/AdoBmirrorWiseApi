// src/utils/mail.helper.js
const transporter = require('../config/mailer');

const sendMail = async ({ to, subject, html }) => {
    return transporter.sendMail({
        from: `"Soporte Giksoft Technology" <${process.env.MAIL_USER}>`, // mismo que auth.user
        to,
        subject,
        html
    });
};

module.exports = { sendMail };
