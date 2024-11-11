import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';
import { MetaProvider as Provider } from '@builderbot/provider-meta';
import { MemoryDB as Database } from '@builderbot/bot';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';


const PORT = process.env.PORT;


//funcion para leer archivos
async function leerArchivo(ruta) {
    try {
        const rutaAbsoluta = path.join(__dirname, 'src', 'textos', ruta);  // Construye la ruta absoluta
        const contenido = await fs.readFile(rutaAbsoluta, 'utf-8');
        return contenido;
    } catch (error) {
        console.error(`Error leyendo el archivo ${ruta}:`, error);
        return 'No se pudo cargar el contenido.';
    }
}




// Función para manejar la selección del usuario
async function manejarSeleccion(ctx, ctxFn, seleccion) {
    const rutas = {
        "info": 'info.txt',
        "uso": 'uso.txt',
        "funcionalidades": 'funcionalidades.txt',
        "beneficios": 'beneficios.txt',
        "ejemplos": 'ejemplos.txt',
        "contact": 'contacto.txt',
        "preguntas": 'preguntas.txt'
    };

    const rutaArchivo = rutas[seleccion];
    if (rutaArchivo) {
        const contenido = await leerArchivo(rutaArchivo);
        await ctxFn.flowDynamic(contenido);
    } else {
        await ctxFn.flowDynamic("Opción no reconocida. Por favor, selecciona una opción válida.");
    }
}

const initialWelcomeFlow = addKeyword(['EVENT.WELCOME']).addAnswer(
    `🙌 ¡Bienvenido a mi *ChatBot* interactivo! Selecciona una de las opciones para continuar:`,
    {
        buttons: [
            { body: 'Probar Bot' },
            { body: 'Contacto' }
        ]
    },
    async (ctx, { provider }) => {
        if (ctx.body.toLowerCase() === 'probar bot') {
            await ctx.reply('Has seleccionado *Probar Bot*. Aquí tienes las opciones disponibles:');
            await ctx.startFlow('welcomeFlow'); // Llama al flujo de opciones principales
        } else if (ctx.body.toLowerCase() === 'contacto') {
            await manejarSeleccion(ctx, ctx, 'contact');
        }
    }
);

// Flujo de Bienvenida
const welcomeFlow = addKeyword(['probar bot', 'probar', 'bot', 'chatbot', 'volver']).addAnswer(
    `🙌 *Explora las opciones que los bots tienen disponibles para vos y tu negocio*`,
    null,
    async (ctx, { provider }) => {
        console.log("Mensaje recibido:", ctx.body); // Muestra el mensaje recibido
        const list = {
            "header": {
                "type": "text",
                "text": "Explora las opciones disponibles"
            },
            "body": {
                "text": "Selecciona una opción para conocer más sobre las capacidades de los bots:",
            },
            "footer": {
                "text": "Elige una opción para comenzar",
            },
            "action": {
                "button": "Opciones",
                "sections": [
                    {
                        "title": "Menú Principal",
                        "rows": [
                            {
                                "id": "info",
                                "title": "ℹ️ Información General",
                                "description": "Conoce más sobre los bots"
                            },
                            {
                                "id": "beneficios",
                                "title": "🚀 Beneficios",
                                "description": "Conoce los beneficios de tener un bot para tu negocio"
                            },
                            {
                                "id": "ejemplos",
                                "title": "🏆 Ejemplos",
                                "description": "Conoce algunos ejemplos de exito"
                            },
                            {
                                "id": "funcionalidades",
                                "title": "🔧 Funcionalidades",
                                "description": "Conoce más sobre las funcionalidades"
                            },
                            {
                                "id": "uso",
                                "title": "🧰 Casos de uso",
                                "description": "Te muestro algunos casos de uso"
                            },
                            {
                                "id": "preguntas",
                                "title": "❓FAQs",
                                "description": "Preguntas Frecuentes"
                            },
                            {
                                "id": "contact",
                                "title": "📞 Contacto",
                                "description": "Ponete en contacto conmigo"
                            },
                        ]
                    }
                ]
            }
        };

        try {
            await provider.sendList(ctx.from, list);
            console.log("Lista enviada exitosamente");  // Línea de depuración
        } catch (error) {
            console.error("Error al enviar la lista:", error);  // Línea de depuración para capturar errores
        }
    }
);

// Flujo de Despedida para "salir" o "cancelar"
const farewellFlow = addKeyword(['salir', 'cancelar']).addAnswer(
    `👋 ¡Gracias por usar el *ChatBot!* Si tienes alguna otra consulta o necesitas ayuda en el futuro, no dudes en volver. ¡Te esperamos! 😊`,
    null,
    (ctx) => {
        console.log("Usuario ha salido de la conversación");
    }
);

// Flujos individuales para manejar cada selección
const contactFlow = addKeyword(['contact']).addAction(async (ctx, ctxFn) => {
    await manejarSeleccion(ctx, ctxFn, 'contact');
});

const usoFlow = addKeyword(['uso']).addAction(async (ctx, ctxFn) => {
    await manejarSeleccion(ctx, ctxFn, 'uso');
});

const infoFlow = addKeyword(['info']).addAction(async (ctx, ctxFn) => {
    await manejarSeleccion(ctx, ctxFn, 'info');
});

const funcionalidadesFlow = addKeyword(['funcionalidades']).addAction(async (ctx, ctxFn) => {
    await manejarSeleccion(ctx, ctxFn, 'funcionalidades');
});

const beneficiosFlow = addKeyword(['beneficios']).addAction(async (ctx, ctxFn) => {
    await manejarSeleccion(ctx, ctxFn, 'beneficios');
});

const ejemplosFlow = addKeyword(['ejemplos']).addAction(async (ctx, ctxFn) => {
    await manejarSeleccion(ctx, ctxFn, 'ejemplos');
});

const preguntasFlow = addKeyword(['preguntas']).addAction(async (ctx, ctxFn) => {
    await manejarSeleccion(ctx, ctxFn, 'preguntas');
});

const main = async () => {
    const adapterFlow = createFlow([
        welcomeFlow,
        farewellFlow,
        contactFlow,
        usoFlow,
        infoFlow,
        funcionalidadesFlow,
        beneficiosFlow,
        ejemplosFlow,
        preguntasFlow,
        initialWelcomeFlow
    ]);

    const adapterProvider = createProvider(Provider, {
        jwtToken: process.env.jwtToken,
        numberId: process.env.numberId,
        verifyToken: process.env.verifyToken,
        version: 'v21.0'
    });

    const adapterDB = new Database();
    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    console.log("Servidor corriendo en el puerto", PORT);
    httpServer(+PORT);
};

main();