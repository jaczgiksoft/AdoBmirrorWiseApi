const AttendanceRepository = require('./attendance.repository');

class AttendanceService {
    async getAllAttendances(filters, tenantId) {
        return await AttendanceRepository.findAll(filters, tenantId);
    }

    async getAttendanceById(id, tenantId) {
        const attendance = await AttendanceRepository.findById(id, tenantId);
        if (!attendance) {
            throw new Error('Attendance record not found');
        }
        return attendance;
    }

    async createAttendance(data, tenantId) {
        // Check if attendance already exists for this employee and date
        const existing = await AttendanceRepository.findByEmployeeAndDate(data.employee_id, data.date, tenantId);
        if (existing) {
            throw new Error('An attendance record already exists for this employee on this date');
        }

        return await AttendanceRepository.create({
            ...data,
            tenant_id: tenantId
        });
    }

    async updateAttendance(id, data, tenantId) {
        const attendance = await this.getAttendanceById(id, tenantId);
        
        // If employee_id or date is changing, check for duplicates
        if ((data.employee_id && data.employee_id !== attendance.employee_id) || (data.date && data.date !== attendance.date)) {
            const checkEmployeeId = data.employee_id || attendance.employee_id;
            const checkDate = data.date || attendance.date;
            
            const existing = await AttendanceRepository.findByEmployeeAndDate(checkEmployeeId, checkDate, tenantId);
            if (existing && existing.id !== id) {
                throw new Error('An attendance record already exists for this employee on this date');
            }
        }

        return await AttendanceRepository.update(attendance, data);
    }

    async deleteAttendance(id, tenantId) {
        const attendance = await this.getAttendanceById(id, tenantId);
        return await AttendanceRepository.delete(attendance);
    }
}

module.exports = new AttendanceService();
