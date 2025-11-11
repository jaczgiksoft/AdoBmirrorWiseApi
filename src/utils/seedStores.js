// src/utils/seedStores.js
const Tenant = require('../models/mysql/tenant.model');
const Store = require('../models/mysql/store.model');

const seedStores = async () => {
    // Clínicas base (coinciden con seedTenants)
    const tenants = [
        { name: 'Clínica Dental Sonrisa Feliz', stores: [
                {
                    name: 'Sonrisa Feliz - Matriz Narvarte',
                    code: 'SF-NARVARTE',
                    address: 'Av. Universidad 245, Col. Narvarte',
                    city: 'Ciudad de México',
                    state: 'CDMX',
                    country: 'México',
                    postal_code: '03020',
                    phone: '+52 55 1234 5678',
                    email: 'narvarte@sonrisafeliz.mx',
                    status: 'active',
                    use_parent_tax_data: true
                },
                {
                    name: 'Sonrisa Feliz - Coyoacán',
                    code: 'SF-COYOACAN',
                    address: 'Av. División del Norte 3000, Col. Del Carmen',
                    city: 'Ciudad de México',
                    state: 'CDMX',
                    country: 'México',
                    postal_code: '04100',
                    phone: '+52 55 5678 4321',
                    email: 'coyoacan@sonrisafeliz.mx',
                    status: 'active',
                    use_parent_tax_data: false,
                    tax_id: 'SFC920315DEF',
                    legal_name: 'Sonrisa Feliz Coyoacán S.A. de C.V.',
                    regime: 'Régimen Simplificado de Confianza'
                }
            ]
        },
        { name: 'Dental Care Premium', stores: [
                {
                    name: 'Dental Care Premium - Providencia',
                    code: 'DCP-PROVIDENCIA',
                    address: 'Av. Patria 890, Col. Providencia',
                    city: 'Guadalajara',
                    state: 'Jalisco',
                    country: 'México',
                    postal_code: '44630',
                    phone: '+52 33 8765 4321',
                    email: 'providencia@dentalcarepremium.mx',
                    status: 'active',
                    use_parent_tax_data: true
                },
                {
                    name: 'Dental Care Premium - Andares',
                    code: 'DCP-ANDARES',
                    address: 'Blvd. Puerta de Hierro 5000, Col. Puerta de Hierro',
                    city: 'Zapopan',
                    state: 'Jalisco',
                    country: 'México',
                    postal_code: '45116',
                    phone: '+52 33 2345 6789',
                    email: 'andares@dentalcarepremium.mx',
                    status: 'active',
                    use_parent_tax_data: false,
                    tax_id: 'DCA850210XYZ',
                    legal_name: 'Dental Care Andares S.A. de C.V.',
                    regime: 'General de Ley Personas Morales'
                }
            ]
        },
        { name: 'Sonrisa Total Nogales', stores: [
                {
                    name: 'Sonrisa Total - Matriz Nogales Centro',
                    code: 'STN-CENTRO',
                    address: 'Av. Obregón 456, Col. Centro',
                    city: 'Nogales',
                    state: 'Sonora',
                    country: 'México',
                    postal_code: '84000',
                    phone: '+52 631 123 4567',
                    email: 'centro@sonrisatotal.com.mx',
                    status: 'active',
                    use_parent_tax_data: true
                },
                {
                    name: 'Sonrisa Total - Sur Nogales',
                    code: 'STN-SUR',
                    address: 'Blvd. El Greco 102, Col. Reforma',
                    city: 'Nogales',
                    state: 'Sonora',
                    country: 'México',
                    postal_code: '84065',
                    phone: '+52 631 765 9876',
                    email: 'sur@sonrisatotal.com.mx',
                    status: 'active',
                    use_parent_tax_data: true
                }
            ]
        }
    ];

    for (const t of tenants) {
        const tenant = await Tenant.findOne({ where: { name: t.name } });
        if (!tenant) {
            console.log(`⚠️ Clínica no encontrada: ${t.name}, primero corre seedTenants`);
            continue;
        }

        for (const s of t.stores) {
            let store = await Store.findOne({ where: { tenant_id: tenant.id, code: s.code } });
            if (!store) {
                store = await Store.create({
                    ...s,
                    tenant_id: tenant.id
                });
                console.log(`✅ Sucursal creada: ${s.name} (clínica: ${t.name})`);
            } else {
                console.log(`ℹ️ Sucursal ya existe: ${s.name} (clínica: ${t.name})`);
            }
        }
    }
};

module.exports = seedStores;
