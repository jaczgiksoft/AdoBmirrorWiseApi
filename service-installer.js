const Service = require('node-windows').Service;

const svc = new Service({
    name: 'BwiseAPI',
    description: 'Bwise Ultimate API Service',
    script: 'E:\\Proyectos\\api-ultimate-bwise\\server.js',
    workingDirectory: 'E:\\Proyectos\\api-ultimate-bwise',
    nodeOptions: [
        '--max-old-space-size=2048'
    ]
});

svc.on('install', function () {
    svc.start();
});

svc.install();
