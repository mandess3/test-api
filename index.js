const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 8000;

// Middleware para aumentar el límite de carga útil (payload)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: '¡Hola desde tu API!' });
});

// Ruta para enviar la foto a la API
app.post('/analizar-emociones', async (req, res) => {
    try {
        // Obtenemos la imagen enviada en el cuerpo de la solicitud
        const imagenBase64 = req.body.imagen;

        // URL de la API
        const visionApiUrl = 'https://hydra-ai.p.rapidapi.com/dev/faces/analyse/';

        // Configuración de la solicitud a la API
        const options = {
            method: 'POST',
            url: visionApiUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': 'dd61107db9msh4553344faa1c39ap1c45d6jsn6ede84274cd6',
            },
            data: {
                image: imagenBase64,
            }
        };

        // Realizamos la solicitud a la API
        const response = await axios(options);

        // Extraemos los datos relevantes de la respuesta
        const emociones = response.data.body.detected_faces[0].info.emotions;

        // Ordenar las emociones por porcentaje de mayor a menor
        const emocionesOrdenadas = Object.entries(emociones).sort((a, b) => b[1] - a[1]);

        // Obtener las tres emociones con los porcentajes más altos
        const tresEmocionesMasAltas = emocionesOrdenadas.slice(0, 3);

        // Traducir los nombres de las emociones al español
        const traducciones = {
            "angry": "enojado",
            "disgust": "asqueado",
            "fear": "miedo",
            "happy": "feliz",
            "sad": "triste",
            "surprise": "sorprendido",
            "neutral": "neutral"
        };

        // Almacenar las tres emociones con los porcentajes más altos en un nuevo array
        const emocionesMasAltasEspanol = {emociones: tresEmocionesMasAltas.map((emocion) => {
            const nombreEmocion = emocion[0];
            const porcentaje = emocion[1];
            const nombreEmocionEspanol = traducciones[nombreEmocion];
            return { emocion: nombreEmocionEspanol, porcentaje: porcentaje * 100 };
        })};

        //const resultadoEmociones = { emociones: emocionesMasAltasEspanol };

        // Respondemos con los porcentajes de las emociones encontradas
        res.json(emocionesMasAltasEspanol);
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        res.status(500).json({ error: 'Error al procesar la imagen' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
