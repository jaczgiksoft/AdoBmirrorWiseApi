const Attendance = require('../../models/mysql/attendance.model');
const Employee = require('../../models/mysql/employee.model');
const { Op } = require('sequelize');

class AttendanceRepository {
    async findAll(filters, tenantId) {
        const { employeeId, startDate, endDate } = filters;
        const where = { tenant_id: tenantId };

        if (employeeId) {
            where.employee_id = employeeId;
        }

        if (startDate && endDate) {
            where.date = { [Op.between]: [startDate, endDate] };
        } else if (startDate) {
            where.date = { [Op.gte]: startDate };
        } else if (endDate) {
            where.date = { [Op.lte]: endDate };
        }

        return await Attendance.findAll({
            where,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'second_last_name', 'profile_image']
                }
            ],
            order: [['date', 'DESC'], ['check_in', 'ASC']]
        });
    }

    async findById(id, tenantId) {
        return await Attendance.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'second_last_name']
                }
            ]
        });
    }

    async findByEmployeeAndDate(employeeId, date, tenantId) {
        return await Attendance.findOne({
            where: { employee_id: employeeId, date, tenant_id: tenantId }
        });
    }

    async create(data) {
        return await Attendance.create(data);
    }

    async update(attendance, data) {
        return await attendance.update(data);
    }

    async delete(attendance) {
        return await attendance.destroy();
    }
}

module.exports = new AttendanceRepository();
