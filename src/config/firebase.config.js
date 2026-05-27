// src/config/firebase.config.js
const admin = require('firebase-admin');

try {
    // 1. Validamos que la variable de entorno exista
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida en el archivo .env');
    }

    // 2. Parseamos el String del .env para convertirlo en el objeto JSON que requiere Firebase
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // 3. Inicializamos el SDK de Firebase
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('>> Firebase Admin SDK inicializado correctamente desde variables de entorno.');
} catch (error) {
    console.error('Error al inicializar Firebase Admin SDK:', error.message);
}

module.exports = admin;