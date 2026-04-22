const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// --- 6.1 GESTIÓN DE PERSONAJES (CRUD COMPLETO) [cite: 20, 31] ---

// Crear personaje [cite: 32]
app.post('/personajes', async (req, res) => {
    try {
        // Atributos: Nombre, Color de piel, Raza, Fuerza, Agilidad, Magia, Conocimiento [cite: 21-30]
        const nuevo = await prisma.personaje.create({ data: req.body });
        res.status(201).json(nuevo);
    } catch (e) {
        res.status(400).json({ error: "Error en la creación del personaje", detalle: e.message });
    }
});

// Listar todos los personajes [cite: 33]
app.get('/personajes', async (req, res) => {
    try {
        const todos = await prisma.personaje.findMany();
        res.json(todos);
    } catch (e) {
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

// Consultar personaje por ID [cite: 34]
app.get('/personajes/:id', async (req, res) => {
    try {
        const p = await prisma.personaje.findUnique({ where: { id: parseInt(req.params.id) } });
        p ? res.json(p) : res.status(404).json({ error: "Personaje no encontrado" });
    } catch (e) {
        res.status(500).json({ error: "Error en la búsqueda por ID" });
    }
});

// Actualizar personaje [cite: 35]
app.put('/personajes/:id', async (req, res) => {
    try {
        const actualizado = await prisma.personaje.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(actualizado);
    } catch (e) {
        res.status(400).json({ error: "Error al actualizar los datos del personaje" });
    }
});

// Eliminar personaje [cite: 36]
app.delete('/personajes/:id', async (req, res) => {
    try {
        await prisma.personaje.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ mensaje: "Registro eliminado exitosamente de la base de datos" });
    } catch (e) {
        res.status(400).json({ error: "No se pudo eliminar el registro" });
    }
});

// --- 6.2 SISTEMA DE BATALLAS [cite: 37] ---

app.post('/batalla', async (req, res) => {
    const { id1, id2 } = req.body; // Recibir dos IDs [cite: 41]

    try {
        const p1 = await prisma.personaje.findUnique({ where: { id: id1 } });
        const p2 = await prisma.personaje.findUnique({ where: { id: id2 } });

        if (!p1 || !p2) return res.status(404).json({ error: "Uno o ambos personajes no existen" });

        // Lógica de combate basada en sumatoria de atributos [cite: 43, 49]
        // La Fuerza, Agilidad, Magia y Conocimiento influyen en el resultado final [cite: 45-48]
        const poder1 = p1.fuerza + p1.agilidad + p1.magia + p1.conocimiento;
        const poder2 = p2.fuerza + p2.agilidad + p2.magia + p2.conocimiento;

        let ganador = poder1 > poder2 ? p1.nombre : (poder2 > poder1 ? p2.nombre : "Empate técnico");

        // Retornar resultado con detalles del combate [cite: 50]
        res.json({
            evento: `Simulación de batalla entre ${p1.nombre} y ${p2.nombre}`,
            estadisticas: {
                [p1.nombre]: { puntaje_total: poder1, raza: p1.raza },
                [p2.nombre]: { puntaje_total: poder2, raza: p2.raza }
            },
            resultado: `Ganador del encuentro: ${ganador}`
        });
    } catch (e) {
        res.status(500).json({ error: "Fallo en la simulación de combate" });
    }
});

// --- INICIO DEL SERVIDOR ---

const PORT = 3000;
app.listen(PORT, () => {
    console.log("------------------------------------------------------------------");
    console.log(`PROYECTO: API REST - GESTIÓN DE RPG Y SIMULACIÓN DE BATALLAS`);
    console.log(`ESTADO: Servidor activo y escuchando en el puerto ${PORT}`);
    console.log(`ENDPOINT PRINCIPAL: http://localhost:${PORT}/personajes`);
    console.log("------------------------------------------------------------------");
});