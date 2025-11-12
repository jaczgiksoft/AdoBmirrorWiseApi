// src/utils/seedPatientsClinic.js
const { fakerES_MX: faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const Tenant = require('../models/mysql/tenant.model');
const Patient = require('../models/mysql/patient.model');
const Referral = require('../models/mysql/referral.model');
const Occupation = require('../models/mysql/occupation.model');
const PatientType = require('../models/mysql/patient_type.model');
const PatientStatus = require('../models/mysql/patient_status.model');
const BracketType = require('../models/mysql/bracket_type.model');
const PatientProfession = require('../models/mysql/patient_profession.model');
const PatientPatientType = require('../models/mysql/patient_patient_type.model');
const { logger } = require('./logger');

const seedPatientsClinic = async () => {
    try {
        const tenants = await Tenant.findAll({ where: { status: 'active' } });
        const hashed = await bcrypt.hash('1234', 10); // Contraseña genérica

        for (const tenant of tenants) {
            logger.info(`🦷 Creando pacientes de prueba para: ${tenant.name}`);

            // Obtener catálogos base
            const [referrals, occupations, types, statuses, brackets, professions] = await Promise.all([
                Referral.findAll({ where: { tenant_id: tenant.id } }),
                Occupation.findAll({ where: { tenant_id: tenant.id } }),
                PatientType.findAll({ where: { tenant_id: tenant.id } }),
                PatientStatus.findAll({ where: { tenant_id: tenant.id } }),
                BracketType.findAll({ where: { tenant_id: tenant.id } }),
                PatientProfession.findAll({ where: { tenant_id: tenant.id } })
            ]);

            if (!types.length) {
                logger.warn(`⚠️ Tipos de paciente vacíos para ${tenant.name}. Ejecuta seedPatientRelationsClinic primero.`);
                continue;
            }

            // Generar pacientes de ejemplo
            const patients = [];

            for (let i = 1; i <= 10; i++) {
                const genre = faker.helpers.arrayElement(['male', 'female']);
                const firstName = faker.person.firstName(genre === 'male' ? 'male' : 'female');
                const lastName = faker.person.lastName();
                const birthDate = faker.date.birthdate({ min: 15, max: 60, mode: 'age' });

                patients.push({
                    tenant_id: tenant.id,
                    medical_record_number: `MRN-${tenant.id}-${1000 + i}`,
                    family_code: `FAM-${tenant.id}`,
                    first_name: firstName,
                    last_name: lastName,
                    middle_name: faker.person.middleName(),
                    nickname: faker.internet.username({ firstName }),
                    genre,
                    birth_date: birthDate,
                    marital_status: faker.helpers.arrayElement(['single', 'married', 'divorced']),
                    phone_number: faker.phone.number('+52##########'),
                    email: faker.internet.email({ firstName, lastName }),

                    referral_id: faker.helpers.arrayElement(referrals)?.id || null,
                    occupation_id: faker.helpers.arrayElement(occupations)?.id || null,
                    bracket_type_id: faker.helpers.arrayElement(brackets)?.id || null,
                    patient_status_id: faker.helpers.arrayElement(statuses)?.id || null,
                    patient_profession_id: faker.helpers.arrayElement(professions)?.id || null,

                    address_street_name: faker.location.street(),
                    address_neighborhood: faker.location.secondaryAddress(),
                    address_street_number: faker.location.buildingNumber(),
                    address_city: faker.location.city(),
                    address_state: faker.location.state(),
                    address_country: 'México',

                    rfc: faker.string.alphanumeric({ length: 13 }),
                    company: faker.company.name(),
                    company_address: faker.location.streetAddress(),
                    photo_url: faker.image.avatarGitHub(),

                    is_under_medical_treatment: faker.datatype.boolean(),
                    current_treatment_description: faker.lorem.sentence(),
                    is_taking_medication: faker.datatype.boolean(),
                    current_medications: faker.lorem.words(3),
                    is_allergic_to_medication: faker.datatype.boolean(),
                    allergies_description: 'Penicilina',

                    has_diabetes: faker.datatype.boolean(),
                    has_migraines: faker.datatype.boolean(),
                    has_psychological_conditions: faker.datatype.boolean(),
                    has_heart_conditions: faker.datatype.boolean(),

                    is_pregnant: genre === 'female' ? faker.datatype.boolean() : false,
                    pregnancy_weeks: null,

                    has_received_fluoride: faker.datatype.boolean(),
                    has_bleeding_gums: faker.datatype.boolean(),
                    grinds_teeth: faker.datatype.boolean(),
                    breathes_through_mouth: faker.datatype.boolean(),

                    username: `paciente${tenant.id}_${i}`,
                    password: hashed,
                    can_login: faker.datatype.boolean(),
                    first_login: true
                });
            }

            // Crear pacientes en bloque
            const createdPatients = await Patient.bulkCreate(patients, { returning: true });

            // Asociar tipos de paciente (N:M)
            const pivotRecords = [];
            for (const patient of createdPatients) {
                // Cada paciente puede tener 1–3 tipos aleatorios
                const randomTypes = faker.helpers.arrayElements(types, faker.number.int({ min: 1, max: 3 }));
                for (const type of randomTypes) {
                    pivotRecords.push({
                        tenant_id: tenant.id,
                        patient_id: patient.id,
                        patient_type_id: type.id
                    });
                }
            }

            await PatientPatientType.bulkCreate(pivotRecords, { ignoreDuplicates: true });

            logger.info(`✅ Pacientes y tipos asociados creados para ${tenant.name}`);
        }

        logger.info('🎯 Seed de pacientes completado correctamente.');
    } catch (err) {
        logger.error(`❌ Error en seedPatientsClinic: ${err.message}`, {
            stack: err.stack
        });
    }
};

module.exports = seedPatientsClinic;
