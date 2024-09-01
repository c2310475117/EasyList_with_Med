// backend/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import listRoutes from './routes/listRoutes.js';
import { controllerRoutes } from './routes/controllerRoutes.js';
import { syncDatabase } from './db.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Konfiguration von CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
console.log("CORS-Konfiguration erfolgreich angewendet.");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendPath = path.join(__dirname, '../fe');
console.log("Frontendpath is:" + frontendPath);


// Serve static files from the frontend directory
app.use(express.static(frontendPath));

// Route to serve the login/register page
app.get('/', (req, res) => {
  console.log('Root route accessed. Serving index.html.');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Route to serve the todo list page (todo.html)
app.get('/todo.html', (req, res) => {
  console.log('Register route accessed. Serving todo.html.');
  res.sendFile(path.join(frontendPath, 'todo.html'));
});

// Synchronize database and define routes
syncDatabase().then(() => {
  console.log('Database synchronized. Starting server.');

  // Initialize controller routes if needed
  controllerRoutes();

  // Define additional routes
  app.use('/user', userRoutes);
  app.use('/list', listRoutes);



  // Test route to verify server is running
  app.get('/api/message', (req, res) => {
    res.json({ message: 'HELLO!' });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to synchronize database:', error);
  process.exit(1);
});
