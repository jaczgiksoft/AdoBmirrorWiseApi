const productService = require('./product.service');

/**
 * Obtener todos los productos del tenant actual
 */
const getAll = async (req, res) => {
    try {
        const products = await productService.getAllProducts(req.user);
        return res.status(200).json(products);
    } catch (err) {
        return res.status(403).json({ message: err.message });
    }
};

/**
 * Obtener un producto por ID
 */
const getOne = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id, req.user);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.status(200).json(product);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

/**
 * Crear nuevo producto
 */
const create = async (req, res) => {
    try {
        const { profit_margin, promo_price, is_pack, units_per_pack, is_bulk } = req.body;

        // ⚙️ Validaciones lógicas previas al service
        if (is_pack && (!units_per_pack || units_per_pack <= 0)) {
            return res.status(400).json({
                message: 'Debe especificar una cantidad válida en "units_per_pack" si el producto es un paquete.',
            });
        }

        if (is_bulk && is_pack) {
            return res.status(400).json({
                message: 'Un producto no puede ser simultáneamente de tipo "paquete" y "a granel".',
            });
        }

        if (profit_margin == null && promo_price == null) {
            // Al menos uno debe estar definido o heredado
            return res.status(400).json({
                message:
                    'Debe especificar un margen de ganancia o un precio promocional. Si no, el sistema heredará el margen del nivel superior.',
            });
        }

        const product = await productService.createProduct(req.body, req.user, req);
        return res.status(201).json({ message: 'Producto creado correctamente', product });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

/**
 * Actualizar producto existente
 */
const update = async (req, res) => {
    try {
        const { profit_margin, promo_price, is_pack, units_per_pack, is_bulk } = req.body;

        // ⚙️ Validaciones previas al update
        if (is_pack && (!units_per_pack || units_per_pack <= 0)) {
            return res.status(400).json({
                message: 'Debe especificar una cantidad válida en "units_per_pack" si el producto es un paquete.',
            });
        }

        if (is_bulk && is_pack) {
            return res.status(400).json({
                message: 'Un producto no puede ser simultáneamente de tipo "paquete" y "a granel".',
            });
        }

        const product = await productService.updateProduct(req.params.id, req.body, req.user, req);
        return res.status(200).json({ message: 'Producto actualizado correctamente', product });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

/**
 * Eliminación lógica del producto
 */
const softDelete = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id, req.user, req);
        return res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

/**
 * DataTable (paginado + búsqueda)
 */
const getDatatable = async (req, res) => {
    try {
        const result = await productService.getProductsDatatable(req.body, req.user);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    softDelete,
    getDatatable,
};
