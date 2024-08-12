const express = require("express");
const app = express();

const productsRouter = require("./routes/productsRouter.js");
const cartsRouter = require("./routes/cartsRouter.js");

//AGREGADO

const ProductsManager = require("./dao/ProductsManager.js");
const CartsManager = require("./dao/CartsManager.js");

//AGREGADO
ProductsManager.path="./src/data/products.json";
CartsManager.path="./src/data/carts.json"


app.use(express.json()); // Middleware para parsear JSON

// Uso los routers con las rutas correctas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

//AGREGADO
app.get(`/`, (req, res) => {
  res.setHeader(`Content-Type`, `text/plain`);
  res.status(200).send(`OK`);
});

//Puerto 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});
