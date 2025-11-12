'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.removeColumn('patients', 'patient_type_id');
        } catch (err) {
            console.warn('⚠️ No se pudo eliminar patient_type_id:', err.message);
        }

        await queryInterface.createTable('patient_patient_types', {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'patients', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            patient_type_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'patient_types', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            deletedAt: { type: Sequelize.DATE, allowNull: true }
        });

        await queryInterface.addIndex('patient_patient_types', ['tenant_id'], { name: 'ppt_tenant_idx' });
        await queryInterface.addIndex('patient_patient_types', ['patient_id'], { name: 'ppt_patient_idx' });
        await queryInterface.addIndex('patient_patient_types', ['patient_type_id'], { name: 'ppt_type_idx' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_patient_types');
        await queryInterface.addColumn('patients', 'patient_type_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'patient_types', key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    }
};
