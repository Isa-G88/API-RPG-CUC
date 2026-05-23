const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Permite el intercambio de datos en formato estricto JSON

// 1. RUTA PARA CREAR PERSONAJES (POST /personajes)
app.post('/personajes', async (req, res) => {
    try {
        const { nombre, colorPiel, raza, fuerza, agilidad, magia, conocimiento } = req.body;
        const nuevoPersonaje = await prisma.personaje.create({
            data: {
                nombre,
                colorPiel,
                raza,
                fuerza: parseInt(fuerza),
                agilidad: parseInt(agilidad),
                magia: parseInt(magia),
                conocimiento: parseInt(conocimiento)
            }
        });
        res.status(201).json(nuevoPersonaje);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el personaje" });
    }
});

// 2. RUTA PARA LISTAR TODOS LOS PERSONAJES (GET /personajes)
app.get('/personajes', async (req, res) => {
    try {
        const personajes = await prisma.personaje.findMany();
        res.json(personajes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los personajes" });
    }
});

// 3. RUTA PARA LA SIMULACIÓN DE BATALLA (POST /batalla)
app.post('/batalla', async (req, res) => {
    try {
        const { id1, id2 } = req.body; // Recibe los IDs únicos de los contrincantes

        const p1 = await prisma.personaje.findUnique({ where: { id: parseInt(id1) } });
        const p2 = await prisma.personaje.findUnique({ where: { id: parseInt(id2) } });

        if (!p1 || !p2) {
            return res.status(404).json({ error: "Uno o ambos personajes no existen en el sistema" });
        }

        // Algoritmo matemático del Puntaje de Poder Total (PPT)
        const ppt1 = p1.fuerza + p1.agilidad + p1.magia + p1.conocimiento;
        const ppt2 = p2.fuerza + p2.agilidad + p2.magia + p2.conocimiento;

        let resultadoMsg = "";
        if (ppt1 > ppt2) {
            resultadoMsg = `Ganador del encuentro: ${p1.nombre}`;
        } else if (ppt2 > ppt1) {
            resultadoMsg = `Ganador del encuentro: ${p2.nombre}`;
        } else {
            resultadoMsg = "Empate técnico en el campo de batalla";
        }

        // Retorna la respuesta en formato JSON detallado
        res.json({
            evento: `Simulación de batalla entre ${p1.nombre} y ${p2.nombre}`,
            estadisticas: {
                [p1.nombre]: { puntaje_total: ppt1, raza: p1.raza },
                [p2.nombre]: { puntaje_total: ppt2, raza: p2.raza }
            },
            resultado: resultadoMsg
        });

    } catch (error) {
        res.status(500).json({ error: "Error interno al procesar la batalla" });
    }
});

// CONFIGURACIÓN DINÁMICA DEL PUERTO (Obligatorio para que funcione al desplegar en internet)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo exitosamente en el puerto ${PORT}`);
});