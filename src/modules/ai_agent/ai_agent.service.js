const OpenAI = require('openai');
const aiAgentRepository = require('./ai_agent.repository');
const appointmentService = require('../appointment/appointment.service');
const employeeService = require('../employee/employee.service');
const serviceService = require('../service/service.service');
const { createLog } = require('../../utils/log.helper');
const { logger } = require('../../utils/logger');

// Inicializar OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Definición de Herramientas para OpenAI
const aiTools = [
    {
        type: "function",
        function: {
            name: "get_available_services_and_doctors",
            description: "Obtiene la lista de servicios odontológicos disponibles con sus precios, y la lista de doctores disponibles. Utilízalo ANTES de agendar una cita para conocer los IDs y precios exactos.",
            parameters: {
                type: "object",
                properties: {}, // No necesita parámetros
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_patient_appointments",
            description: "Obtiene el historial clínico y las citas (pasadas y futuras) del paciente actual.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_appointment",
            description: "Agenda una nueva cita para el paciente actual. Es obligatorio proveer todos los datos requeridos. Si falta alguno, pregúntaselo al paciente antes de usar esta función.",
            parameters: {
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        description: "Fecha de la cita en formato YYYY-MM-DD"
                    },
                    start_time: {
                        type: "string",
                        description: "Hora de inicio en formato HH:mm"
                    },
                    end_time: {
                        type: "string",
                        description: "Hora de finalización en formato HH:mm (Asume 30 o 60 min de duración según el servicio)"
                    },
                    employee_id: {
                        type: "integer",
                        description: "El ID del doctor asignado. Debes obtenerlo antes mediante get_available_services_and_doctors"
                    },
                    service_id: {
                        type: "integer",
                        description: "El ID del servicio. Debes obtenerlo antes mediante get_available_services_and_doctors"
                    },
                    service_name: {
                        type: "string",
                        description: "El nombre del servicio"
                    },
                    price: {
                        type: "number",
                        description: "El precio o total_amount de la cita, igual al precio del servicio seleccionado."
                    },
                    notes: {
                        type: "string",
                        description: "Notas adicionales que dejó el paciente para la cita (opcional)"
                    }
                },
                required: ["date", "start_time", "end_time", "employee_id", "service_id", "service_name", "price"]
            }
        }
    }
];

class AiAgentService {

    /**
     * Procesa la entrada del chat, interactúa con el historial, define el contexto y llama a OpenAI.
     */
    async processChat(patient_id, message, currentUser, req) {
        const tenant_id = currentUser.tenant_id;

        // --- NUEVA LÍNEA: Obtener fecha actual ---
        const now = new Date();
        const currentDateTime = now.toLocaleString(); // Ejemplo: "20/4/2024, 14:30:00"
        const today = now.toISOString().split('T')[0];
        // -----------------------------------------

        // 1. Guardar mensaje del usuario
        await aiAgentRepository.saveMessage(patient_id, tenant_id, 'user', message);

        // 2. Recuperar historial reciente
        const rawHistory = await aiAgentRepository.getRecentMessages(patient_id, tenant_id, 15);

        // 3. Crear Contexto del Sistema
        // IMPORTANTE: Instruimos a la IA para asumir clinic_area_id = 1 (o la principal)
        const systemPrompt = {
            role: "system",
            content: `Eres un asistente virtual avanzado y amigable de una clínica odontológica. 
Tu trabajo es ayudar al paciente a consultar sobre sus citas agendadas y, si lo desea, agendar una nueva.

CONTEXTO TEMPORAL:
- La fecha de hoy es: ${today}. 
- Si el paciente menciona un día y mes pero no el año, asume que se refiere al año actual (${today.split('-')[0]}), a menos que esa fecha ya haya pasado, en cuyo caso asume el año siguiente.

Reglas estrictas:
- Respuestas cortas, empáticas y claras.
- Si el paciente quiere agendar una cita y no sabes qué servicio, qué doctor o qué fecha quiere, PREGÚNTALE. 
- Antes de agendar una cita con "create_appointment", debes CONOCER el servicio y el doctor deseados. Si no sabes los IDs, EJECUTA la función "get_available_services_and_doctors".
- El campo "price" que te devuelve la herramienta de servicios será el "total_amount" para "create_appointment".
- Asume que "clinic_area_id" es por defecto 1 si necesitas agendar (se maneja en el backend internamente, pero ignóralo o asume 1).
- El id del paciente ya es conocido en el sistema, no lo pidas (es el paciente actual con el que interactúas).`
        };

        // Dar formato compatible con OpenAI al historial
        const messagesToSend = [systemPrompt];

        const validMessages = [];
        for (let i = 0; i < rawHistory.length; i++) {
            const msg = rawHistory[i];

            if (msg.role === 'tool') {
                const hasAssistant = validMessages.some(m => m.role === 'assistant' && m.tool_calls && m.tool_calls.some(tc => tc.id === msg.tool_call_id));
                if (!hasAssistant) continue; // Skip orphaned tool message
            }

            if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
                let allToolsHandled = true;
                for (const tc of msg.tool_calls) {
                    const hasTool = rawHistory.slice(i + 1).some(m => m.role === 'tool' && m.tool_call_id === tc.id);
                    if (!hasTool) {
                        allToolsHandled = false;
                        break;
                    }
                }
                if (!allToolsHandled) {
                    if (!msg.message) continue;
                    msg.tool_calls = null;
                }
            }

            const formattedMsg = {
                role: msg.role,
                content: msg.message || null
            };

            if (msg.tool_calls) {
                formattedMsg.tool_calls = msg.tool_calls.map(tc => ({
                    id: tc.id,
                    type: tc.type || "function",
                    function: {
                        name: tc.function?.name,
                        arguments: tc.function?.arguments
                    }
                }));
            }
            if (msg.tool_call_id) formattedMsg.tool_call_id = msg.tool_call_id;
            if (msg.name) formattedMsg.name = msg.name;

            validMessages.push(formattedMsg);
        }

        messagesToSend.push(...validMessages);

        // Llamar por primera vez a OpenAI
        let response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messagesToSend,
            tools: aiTools,
            tool_choice: "auto",
        });

        let responseMessage = response.choices[0].message;

        // 4. Procesar el ciclado si la IA decidió mandar a llamar una "Tool/Function"
        while (responseMessage.tool_calls) {
            // Guardar la intención de OpenAI en el historial local
            await aiAgentRepository.saveMessage(
                patient_id,
                tenant_id,
                responseMessage.role,
                null,
                responseMessage.tool_calls
            );

            messagesToSend.push(responseMessage); // Lo necesitamos para pasarlo devuelta al modelo

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                let functionResult = null;

                try {
                    logger.info(`[AI Agent] Ejecutando tool: ${functionName}`);

                    if (functionName === 'get_available_services_and_doctors') {
                        // Reutilizamos los servicios disponibles
                        const doctors = await employeeService.getDoctors(currentUser);
                        const services = await serviceService.getAllServices(currentUser);

                        functionResult = JSON.stringify({
                            doctors: doctors.map(d => ({ id: d.id, name: `${d.first_name} ${d.last_name}`, specialty: d.positions?.map(p => p.name).join(', ') || 'General' })),
                            services: services.map(s => ({ id: s.id, name: s.name, price: s.price }))
                        });

                    } else if (functionName === 'get_patient_appointments') {
                        const appointments = await appointmentService.getAppointmentsByPatient(patient_id, currentUser, req);
                        // Filtramos un poco los datos para no ensuciar el contexto que consume OpenAI
                        functionResult = JSON.stringify(appointments.map(a => ({
                            id: a.id,
                            date: a.date,
                            status: a.status,
                            amount: a.total_amount,
                            doctor: a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : 'No Asignado'
                        })));
                    } else if (functionName === 'create_appointment') {

                        // Preparar payload para la cita
                        const payload = {
                            patient_id: patient_id, // Forzado al paciente actual
                            employee_id: args.employee_id,
                            clinic_area_id: 1, // Por defecto como pidió el scope de la regla
                            date: args.date,
                            start_time: args.start_time,
                            end_time: args.end_time,
                            status: 'pendiente',
                            total_amount: args.price,
                            unit_value: 15,
                            units: 1,
                            notes: args.notes || 'Cita generada por asistente virtual (IA)',
                            services: [
                                {
                                    service_id: args.service_id,
                                    service_name: args.service_name,
                                    price: args.price,
                                    // Calculamos duración en base a los bloques enviados
                                    duration_minutes: 30
                                }
                            ]
                        };

                        const newAppt = await appointmentService.createAppointment(payload, currentUser, req);
                        functionResult = JSON.stringify({ success: true, message: "Appointment created", appointment_id: newAppt.id });
                    }
                } catch (err) {
                    logger.error(`[AI Agent] Error en tool ${functionName}:`, err);
                    functionResult = JSON.stringify({ error: err.message });
                }

                // Append function response a los mensajes para resolver
                const toolResponseMsg = {
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResult,
                };

                messagesToSend.push(toolResponseMsg);
                // Guardar la respuesta local
                await aiAgentRepository.saveMessage(
                    patient_id,
                    tenant_id,
                    'tool',
                    functionResult,
                    null,
                    toolCall.id,
                    functionName
                );
            }

            // Llamar a OpenAI nuevamente con el resultado de las herramientas
            response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messagesToSend
            });
            responseMessage = response.choices[0].message;
        }

        // 5. Devolver lo que la IA haya resuelto al final y guardarlo
        const systemFinalText = responseMessage.content;
        await aiAgentRepository.saveMessage(patient_id, tenant_id, 'assistant', systemFinalText);

        // Opcional: Logs de auditoria como se definio
        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'chat',
            module: 'ai_agent',
            description: `Interacción con el paciente ID: ${patient_id}`,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        return {
            content: systemFinalText
        };
    }
}

module.exports = new AiAgentService();
