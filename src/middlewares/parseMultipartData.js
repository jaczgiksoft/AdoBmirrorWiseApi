const parseMultipartData = (req, res, next) => {
    try {
        if (req.body?.data && typeof req.body.data === 'string') {
            req.body = JSON.parse(req.body.data);
        }
        next();
    } catch (error) {
        return res.status(400).json({
            message: 'Error parsing request data'
        });
    }
};

module.exports = parseMultipartData;