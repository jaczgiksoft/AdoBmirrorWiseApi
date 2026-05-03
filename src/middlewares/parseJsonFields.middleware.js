module.exports = function parseJsonFields(req, res, next) {
    const jsonFields = [
        "patient_type_ids",
        "billing_data",
        "legal_representatives",
        "alerts",
        "odontogram_data",
        "positionIds"
    ];

    jsonFields.forEach(field => {
        if (typeof req.body[field] === "string") {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch {
                req.body[field] = [];
            }
        }
    });

    next();
};
