import express from "express";
import { engine } from "express-handlebars";
import vistasRouter from "./routes/vistasRouter.js";
import productRouter from "./routes/productRouter.js"; 
import methodOverride from 'method-override';
import { Server } from "socket.io"; 
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Obtener el directorio actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;
const app = express();
const serverHTTP = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

const serverSocket = new Server(serverHTTP); // Inicializa serverSocket

// Middleware globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static("./src/public"));

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Usa serverSocket en el productRouter
app.use("/", vistasRouter);
app.use("/api/products", (req, res, next) => {
  req.socket = serverSocket;
  next();
}, productRouter);


app.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts');
});


// Para agregar un producto por formulario en products.handlebars
app.use("/products", (req, res) => {
  let { nombre } = req.body;
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ payload: nombre });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).render("404");
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error");
});

// Configuración de eventos de Socket.IO
serverSocket.on("connection", (socket) => {
  console.log(`Se conectó un cliente con id ${socket.id}`);

  // Emitir un saludo al cliente conectado
  socket.emit("saludo", "Bienvenido al server!");

  // Manejar evento 'id' emitido por el cliente
  socket.on("id", (nombre) => {
    console.log(`El cliente con id ${socket.id} se ha identificado como ${nombre}`);
    socket.broadcast.emit("nuevoUsuario", nombre); // Emitir a todos los demás
  });

  // Manejar la desconexión de un cliente
  socket.on("disconnect", () => {
    console.log("Desconectado del servidor de Socket.IO");
  });
 // Manejar el evento para actualizar productos
 socket.on("actualizarProductos", () => {
  // Leer el archivo de productos y emitir la lista actualizada
  const productosPath = join(__dirname, 'data', 'products.json');
  const productos = JSON.parse(readFileSync(productosPath, 'utf-8'));
  serverSocket.emit('productosActualizados', productos); // Emitir a todos los clientes
});

// Manejar la desconexión de un cliente
socket.on("disconnect", () => {
  console.log("Desconectado del servidor de Socket.IO");
});
});

export { serverSocket };
