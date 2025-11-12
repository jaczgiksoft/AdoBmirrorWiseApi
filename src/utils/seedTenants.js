// src/utils/seedTenants.js
const Tenant = require('../models/mysql/tenant.model');
const Subscription = require('../models/mysql/subscription.model');
const crypto = require('crypto');
const { logger } = require('./logger'); // opcional

const seedTenants = async () => {
    const tenants = [
        {
            name: 'Clínica Dental Sonrisa Feliz',
            description: 'Clínica dental integral con servicios de ortodoncia, endodoncia y odontopediatría.',
            logo_url: 'https://placehold.co/600x600/2ECC71/white?text=SONRISA',
            website: 'https://sonrisafeliz.mx',
            contact_name: 'Dra. Laura Gómez',
            contact_email: 'contacto@sonrisafeliz.mx',
            contact_phone: '+52 55 1234 5678',
            address: 'Av. Universidad 245, Col. Narvarte',
            city: 'Ciudad de México',
            state: 'CDMX',
            country: 'México',
            postal_code: '03020',
            tax_id: 'SFL920315ABC',
            legal_name: 'Sonrisa Feliz S.A. de C.V.',
            regime: 'Régimen Simplificado de Confianza',
            health_registration: 'COFEPRIS-DF-2025-01234',
            health_registration_expires_at: new Date('2026-12-31'),
            specialties: ['Ortodoncia', 'Endodoncia', 'Odontopediatría'],
            number_of_rooms: 4,
            max_users: 10,
            current_users: 0
        },
        {
            name: 'Dental Care Premium',
            description: 'Clínica especializada en estética dental y blanqueamiento profesional.',
            logo_url: 'https://placehold.co/600x600/3498DB/white?text=DENTALCARE',
            website: 'https://dentalcarepremium.mx',
            contact_name: 'Dr. Alejandro Pérez',
            contact_email: 'info@dentalcarepremium.mx',
            contact_phone: '+52 33 8765 4321',
            address: 'Av. Patria 890, Col. Providencia',
            city: 'Guadalajara',
            state: 'Jalisco',
            country: 'México',
            postal_code: '44630',
            tax_id: 'DCP850210XYZ',
            legal_name: 'Dental Care Premium S.A. de C.V.',
            regime: 'General de Ley Personas Morales',
            health_registration: 'COFEPRIS-JAL-2024-00456',
            health_registration_expires_at: new Date('2025-09-30'),
            specialties: ['Estética dental', 'Implantes', 'Blanqueamiento'],
            number_of_rooms: 6,
            max_users: 15,
            current_users: 0
        },
        {
            name: 'Sonrisa Total Nogales',
            description: 'Consultorio dental familiar con atención general y ortodoncia.',
            logo_url: 'https://placehold.co/600x600/E67E22/white?text=TOTAL',
            website: 'https://sonrisatotal.com.mx',
            contact_name: 'Dra. Fernanda Morales',
            contact_email: 'contacto@sonrisatotal.com.mx',
            contact_phone: '+52 631 123 4567',
            address: 'Av. Obregón 456, Col. Centro',
            city: 'Nogales',
            state: 'Sonora',
            country: 'México',
            postal_code: '84000',
            tax_id: 'STN910715LMN',
            legal_name: 'Sonrisa Total Nogales S. de R.L.',
            regime: 'Régimen Simplificado de Confianza',
            health_registration: 'COFEPRIS-SON-2025-07890',
            health_registration_expires_at: new Date('2026-06-15'),
            specialties: ['Odontología general', 'Ortodoncia'],
            number_of_rooms: 3,
            max_users: 8,
            current_users: 0
        }
    ];

    for (const t of tenants) {
        const existing = await Tenant.findOne({ where: { name: t.name } });
        if (!existing) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            const tenant = await Tenant.create({
                ...t,
                code,
                currency: 'MXN',
                timezone: 'America/Hermosillo',
                status: 'active'
            });

            const sub = await Subscription.create({
                tenant_id: tenant.id,
                plan_name: 'Professional',
                start_date: new Date(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                max_users: t.max_users,
                price_monthly: 79.99,
                extra_user_price: 9.99,
                status: 'active'
            });

            tenant.current_subscription_id = sub.id;
            await tenant.save();

            console.log(`✅ Clínica creada: ${tenant.name} (code: ${code})`);
        } else {
            console.log(`ℹ️ Clínica ya existe: ${t.name}`);
        }
    }
};

module.exports = seedTenants;
