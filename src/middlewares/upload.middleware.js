const multer = require("multer");
const path = require("path");
const fs = require("fs");

// === Tipos permitidos === //
const allowedMimeTypes = {
    images: ["image/jpeg", "image/png", "image/jpg"],
    documents: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
};

// === Filtro dinámico de archivos === //
const fileFilter = (field) => (req, file, cb) => {
    if (!allowedMimeTypes[field].includes(file.mimetype)) {
        return cb(new Error(`Tipo de archivo no permitido para ${field}`), false);
    }
    cb(null, true);
};

// === Función utilitaria para crear rutas === //
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
}

// === Storage dinámico por módulo === //

// 1️⃣ Tenants (logo principal)
const tenantStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tenantId = req.user?.tenant_id || "unknown";
        const dir = ensureDir(path.join(__dirname, `../../uploads/${tenantId}/tenant`));
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// 2️⃣ Usuarios (imagen de perfil)
const userProfileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tenantId = req.user?.tenant_id || "unknown";
        // 🗂️ Igual que stores: primero guardamos en una carpeta temporal
        const dir = ensureDir(path.join(__dirname, `../../uploads/${tenantId}/users/temp`));
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// 3️⃣ Tiendas (logo / banner)
const storeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tenantId = req.user?.tenant_id || "unknown";
        const dir = ensureDir(path.join(__dirname, `../../uploads/${tenantId}/stores/temp`));
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const base = file.fieldname === "logo" ? "logo" : "banner";
        cb(null, `${base}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// 4️⃣ Productos (imagen principal)
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tenantId = req.user?.tenant_id || "unknown";
        const productId = req.params.id || "temp";
        const dir = ensureDir(path.join(__dirname, `../../uploads/${tenantId}/products/${productId}`));
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `product_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// 5️⃣ Pacientes (foto de perfil)
const patientStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tenantId = req.user?.tenant_id || "unknown";
        const mrn = req.body.medical_record_number || "temp";

        const dir = ensureDir(
            path.join(__dirname, `../../uploads/${tenantId}/patients/${mrn}/profile`)
        );

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`);
    }
});

// === Inicializaciones de Multer === //
const uploadTenantLogo = multer({
    storage: tenantStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter("images"),
}).single("logo");

const uploadUserProfile = multer({
    storage: userProfileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter("images"),
}).single("profile_image");

const uploadStoreImages = multer({
    storage: storeStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter("images"),
}).fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]);

const uploadProductImage = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter("images"),
}).single("image");

const uploadPatientPhoto = multer({
    storage: patientStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter("images"),
}).single("photo");

// === Exportaciones === //
module.exports = {
    uploadTenantLogo,       // Tenant (campo: logo)
    uploadUserProfile,      // Usuario (campo: profile_image)
    uploadStoreImages,      // Tienda (campos: logo, banner)
    uploadProductImage,     // Producto (campo: image)
    uploadPatientPhoto,     // Paciente (campo: photo_url)
};
