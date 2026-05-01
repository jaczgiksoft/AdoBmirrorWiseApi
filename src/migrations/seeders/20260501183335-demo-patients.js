'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    const patients = [];

    for (let i = 1; i <= 20; i++) {
      patients.push({
        tenant_id: 1,
        medical_record_number: `MRN-${1000 + i}`,
        family_code: `FAM-${Math.ceil(i / 3)}`,

        first_name: "-" + faker.person.firstName(),
        last_name: faker.person.lastName(),
        middle_name: faker.person.middleName(),
        nickname: null,

        genre: faker.helpers.arrayElement(['male', 'female']),
        birth_date: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),

        marital_status: faker.helpers.arrayElement(['single', 'married']),

        phone_number: faker.number.int({ min: 6000000000, max: 7999999999 }).toString(),
        email: faker.internet.email(),

        referral_id: null,
        occupation_id: null,
        bracket_type_id: null,
        patient_status_id: null,
        patient_profession_id: null,

        address_street_name: faker.location.street(),
        address_neighborhood: faker.location.city(),
        address_apartment_number: null,
        address_street_number: faker.number.int({ min: 1, max: 999 }).toString(),
        address_zip_code: faker.location.zipCode(),
        address_city: faker.location.city(),
        address_state: faker.location.state(),
        address_country: 'México',

        rfc: null,
        company: faker.company.name(),
        company_address: faker.location.streetAddress(),

        photo_url: null,
        medical_record_image_url: null,

        is_under_medical_treatment: false,
        current_treatment_description: null,
        is_taking_medication: false,
        current_medications: null,
        is_allergic_to_medication: false,
        allergies_description: null,

        has_hepatitis: false,
        has_diabetes: faker.datatype.boolean(),
        has_lung_conditions: false,
        has_migraines: faker.datatype.boolean(),
        has_amigdalitis: false,
        has_adenoiditis: false,
        has_epilepsy: false,
        has_rheumatic_fever: false,
        has_psychological_conditions: false,
        has_heart_conditions: false,
        has_hemophilia: false,
        has_stds: false,

        is_pregnant: false,
        pregnancy_weeks: null,

        last_radiograph_date: faker.date.past(),
        last_dental_exam_date: faker.date.recent(),

        has_received_fluoride: faker.datatype.boolean(),
        fluoride_date_description: null,
        has_bleeding_gums: faker.datatype.boolean(),
        has_oral_habits: faker.datatype.boolean(),
        chews_on_both_sides: faker.datatype.boolean(),
        has_jaw_pain_or_noise: faker.datatype.boolean(),
        grinds_teeth: faker.datatype.boolean(),
        breathes_through_mouth: faker.datatype.boolean(),
        had_previous_orthodontics: faker.datatype.boolean(),

        username: null,
        password: null,
        can_login: false,
        push_token: null,
        first_login: true,

        created_source: 'system',

        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      });
    }

    await queryInterface.bulkInsert('patients', patients, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('patients', {
      tenant_id: 1,
      created_source: 'system'
    }, {});
  }
};