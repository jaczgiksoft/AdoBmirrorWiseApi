const { body } = require('express-validator');

const createAttendance = [
    body('employee_id')
        .notEmpty().withMessage('Employee ID is required')
        .isInt().withMessage('Employee ID must be an integer'),
    
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
    
    body('check_in')
        .optional({ checkFalsy: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Check-in must be a valid time (HH:mm:ss)'),
    
    body('check_out')
        .optional({ checkFalsy: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Check-out must be a valid time (HH:mm:ss)'),
    
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['present', 'late', 'absent']).withMessage('Invalid status'),
    
    body('notes')
        .optional({ checkFalsy: true })
        .isString().withMessage('Notes must be a string')
];

const updateAttendance = [
    body('employee_id')
        .optional()
        .isInt().withMessage('Employee ID must be an integer'),
    
    body('date')
        .optional()
        .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
    
    body('check_in')
        .optional({ checkFalsy: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Check-in must be a valid time (HH:mm:ss)'),
    
    body('check_out')
        .optional({ checkFalsy: true })
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Check-out must be a valid time (HH:mm:ss)'),
    
    body('status')
        .optional()
        .isIn(['present', 'late', 'absent']).withMessage('Invalid status'),
    
    body('notes')
        .optional({ checkFalsy: true })
        .isString().withMessage('Notes must be a string')
];

module.exports = {
    createAttendance,
    updateAttendance
};
