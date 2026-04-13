const service = require('./extraction_order.service');

const createOrder = async (req, res) => {
    try {
        const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
        const files = req.files || [];
        const result = await service.createOrder(data, req.user, files);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getOrdersByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const result = await service.getOrdersByPatient(patientId, req.user.tenant_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await service.getOrderById(id, req.user.tenant_id);
        if (!result) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await service.updateOrder(id, data, req.user);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await service.deleteOrder(id, req.user.tenant_id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrdersByPatient,
    getOrderById,
    updateOrder,
    deleteOrder
};
