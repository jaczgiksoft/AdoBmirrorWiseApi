const Service = require('node-windows').Service;

const svc = new Service({
    name: 'BwiseAPI',
    script: 'E:\\Proyectos\\api-ultimate-bwise\\server.js'
});

svc.on('uninstall', function () {
    console.log('Servicio desinstalado correctamente.');
});

svc.uninstall();
