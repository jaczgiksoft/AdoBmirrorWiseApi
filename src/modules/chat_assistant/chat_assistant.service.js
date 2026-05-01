const OpenAI = require('openai');
const chatAssistantRepository = require('./chat_assistant.repository');
const { logger } = require('../../utils/logger');

// Inicializar OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ==========================================
// 🛠️ TOOLS DEFINITION
// ==========================================
const aiTools = [
    {
        type: "function",
        function: {
            name: "search_patients_by_name",
            description: "Busca pacientes por nombre o apellido.",
            parameters: {
                type: "object",
                properties: {
                    nameQuery: { type: "string", description: "Nombre o apellido a buscar." }
                },
                required: ["nameQuery"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_patient_clinical_record",
            description: "Obtiene la ficha clínica principal de un paciente.",
            parameters: {
                type: "object",
                properties: {
                    patient_id: { type: "integer", description: "El ID del paciente." }
                },
                required: ["patient_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_patient_alerts",
            description: "Obtiene las alertas médicas de un paciente.",
            parameters: {
                type: "object",
                properties: {
                    patient_id: { type: "integer", description: "El ID del paciente." }
                },
                required: ["patient_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_upcoming_appointments",
            description: "Trae una lista de las próximas citas agendadas a partir de hoy.",
            parameters: {
                type: "object",
                properties: {
                    limit: { type: "integer", description: "Cantidad máxima de citas a retornar (defecto: 10)." }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_patient_odontograms",
            description: "Lista los odontogramas de un paciente.",
            parameters: {
                type: "object",
                properties: {
                    patient_id: { type: "integer", description: "El ID del paciente." }
                },
                required: ["patient_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_odontogram_details",
            description: "Obtiene el detalle de hallazgos y tratamientos de un odontograma específico.",
            parameters: {
                type: "object",
                properties: {
                    odontogram_id: { type: "integer", description: "El ID del odontograma." }
                },
                required: ["odontogram_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_patient_treatment_plans",
            description: "Lista los planes de tratamiento de un paciente.",
            parameters: {
                type: "object",
                properties: {
                    patient_id: { type: "integer", description: "El ID del paciente." }
                },
                required: ["patient_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_treatment_plan_items",
            description: "Obtiene los detalles de un plan de tratamiento.",
            parameters: {
                type: "object",
                properties: {
                    plan_id: { type: "integer", description: "El ID del plan de tratamiento." }
                },
                required: ["plan_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_available_services",
            description: "Consulta el catálogo de servicios odontológicos activos de la clínica.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "get_employees",
            description: "Obtiene la lista de empleados/doctores activos.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "get_clinic_areas",
            description: "Lista las áreas clínicas (ej. sillones, gabinetes).",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "get_inventory_stock",
            description: "Consulta el inventario y stock actual. Se puede filtrar por nombre de producto.",
            parameters: {
                type: "object",
                properties: {
                    search: { type: "string", description: "Nombre del producto a buscar (opcional)." }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_inventory_movements",
            description: "Consulta el historial de movimientos de un artículo específico del inventario.",
            parameters: {
                type: "object",
                properties: {
                    item_id: { type: "integer", description: "El ID del artículo de inventario." },
                    limit: { type: "integer", description: "Cantidad de registros a obtener." }
                },
                required: ["item_id"]
            }
        }
    }
];

class ChatAssistantService {

    /**
     * Process the chat message
     * @param {number|string} tenant_id - Tenant ID from authenticated user
     * @param {string} message - User message
     * @param {Array} chatHistory - Previous chat messages
     * @returns {Object} - Response from the assistant
     */
    async processMessage(tenant_id, message, chatHistory) {
        
        const systemPrompt = {
            role: "system",
            content: `Eres 'Bwise Assistant', un experto en gestión dental y asistente operativo de la clínica.
Tu objetivo es ayudar al personal administrativo y doctores a gestionar y consultar información de la clínica de forma rápida y eficiente.
Debes decidir cuándo usar tus herramientas (tools) para consultar el inventario, revisar el historial de un paciente, consultar citas, tratamientos o empleados.
Asegúrate de dar respuestas claras, profesionales y útiles. Si no sabes algo o te faltan parámetros (como el ID del paciente), pregúntalo directamente al usuario.
La fecha actual es: ${new Date().toISOString().split('T')[0]}.`
        };

        // Construir arreglo de mensajes
        const messagesToSend = [systemPrompt, ...chatHistory, { role: 'user', content: message }];

        try {
            let response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messagesToSend,
                tools: aiTools,
                tool_choice: "auto",
            });

            let responseMessage = response.choices[0].message;

            // Procesar llamadas a herramientas (Tool Calls)
            while (responseMessage.tool_calls) {
                messagesToSend.push(responseMessage); // Guardar intención

                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    let functionResult = null;

                    logger.info(`[Chat Assistant] Ejecutando tool: ${functionName} con args:`, args);

                    try {
                        switch (functionName) {
                            case 'search_patients_by_name':
                                functionResult = await chatAssistantRepository.searchPatientsByName(tenant_id, args.nameQuery);
                                break;
                            case 'get_patient_clinical_record':
                                functionResult = await chatAssistantRepository.getPatientClinicalRecord(tenant_id, args.patient_id);
                                break;
                            case 'get_patient_alerts':
                                functionResult = await chatAssistantRepository.getPatientAlerts(tenant_id, args.patient_id);
                                break;
                            case 'get_upcoming_appointments':
                                functionResult = await chatAssistantRepository.getUpcomingAppointments(tenant_id, args.limit || 10);
                                break;
                            case 'get_patient_odontograms':
                                functionResult = await chatAssistantRepository.getPatientOdontograms(tenant_id, args.patient_id);
                                break;
                            case 'get_odontogram_details':
                                functionResult = await chatAssistantRepository.getOdontogramDetails(tenant_id, args.odontogram_id);
                                break;
                            case 'get_patient_treatment_plans':
                                functionResult = await chatAssistantRepository.getPatientTreatmentPlans(tenant_id, args.patient_id);
                                break;
                            case 'get_treatment_plan_items':
                                functionResult = await chatAssistantRepository.getTreatmentPlanItems(tenant_id, args.plan_id);
                                break;
                            case 'get_available_services':
                                functionResult = await chatAssistantRepository.getAvailableServices(tenant_id);
                                break;
                            case 'get_employees':
                                functionResult = await chatAssistantRepository.getEmployees(tenant_id);
                                break;
                            case 'get_clinic_areas':
                                functionResult = await chatAssistantRepository.getClinicAreas(tenant_id);
                                break;
                            case 'get_inventory_stock':
                                functionResult = await chatAssistantRepository.getInventoryStock(tenant_id, args.search || '');
                                break;
                            case 'get_inventory_movements':
                                functionResult = await chatAssistantRepository.getInventoryMovements(tenant_id, args.item_id, args.limit || 10);
                                break;
                            default:
                                functionResult = { error: `Function ${functionName} not found` };
                        }
                    } catch (err) {
                        logger.error(`[Chat Assistant] Error ejecutando ${functionName}:`, err);
                        functionResult = { error: err.message };
                    }

                    messagesToSend.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: functionName,
                        content: JSON.stringify(functionResult || {}),
                    });
                }

                // Llamar de nuevo a OpenAI con los resultados
                response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: messagesToSend,
                });
                responseMessage = response.choices[0].message;
            }

            // Actualizar historial para enviarlo al frontend
            const updatedHistory = [...chatHistory, 
                { role: 'user', content: message },
                { role: 'assistant', content: responseMessage.content }
            ];

            return {
                reply: responseMessage.content,
                history: updatedHistory
            };

        } catch (error) {
            logger.error('[Chat Assistant] OpenAI Error:', error);
            throw error;
        }
    }
}

module.exports = new ChatAssistantService();
