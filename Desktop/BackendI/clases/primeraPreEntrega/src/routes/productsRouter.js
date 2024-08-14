const express = require("express");
const router = express.Router();
const ProductsManager = require("../dao/ProductsManager.js");

// Ruta para obtener todos los productos, con soporte para ?limit
router.get("/", async (req, res) => {
  try {
    let products = await ProductsManager.getProducts();
    const { limit } = req.query;
    if (limit) {
      const limitNumber = parseInt(limit, 10);
      if (!isNaN(limitNumber) && limitNumber > 0) {
        products = products.slice(0, limitNumber);
      } else {
        return res
          .status(400)
          .json({ error: "El límite debe ser un número positivo." });
      }
    }

    res.json(products);
  } catch (error) {
    console.log("Error en el GET de productos:", error);
    return res.status(500).json({ error: "Error al obtener los productos", detalle: error.message });
  }
});

// Ruta para obtener un producto por su ID (pid)
router.get("/:pid", async (req, res) => {
  const { pid: productId } = req.params;
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) {
    return res.status(400).json({ error: "ID del producto inválido" });
  }

  try {
    const products = await ProductsManager.getProducts();
    const product = products.find((p) => p.id === parsedProductId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error.message);
    res
      .status(500)
      .json({ error: `Error al obtener el producto: ${error.message}` });
  }
});

// Ruta para agregar un producto a la lista
router.post("/", async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails = [],
  } = req.body;
  if (!title || !description || !code || !price || !stock || !category) {
    res.setHeader(`Content-Type`, `aplication/json`);
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
     // Obtener la lista de productos existentes
     const productos = await ProductsManager.getProducts();

     // Validar si el producto ya existe basándose en el código
     const existingProduct = productos.find(p=>p.code === code);
     if (existingProduct) {
      res.setHeader(`Content-Type`, `aplication/json`);
    return res.status(400).json({ error: "Producto inexistente" });
     
     }
 
     // Crear el nuevo producto
    const nuevoProducto = await ProductsManager.create({title,description,code,price,stock,category,thumbnails,
  status: true,})
    res.setHeader("Content-Type", "application/json");
    return res.status(201).json({nuevoProducto});
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error al agregar el producto:`,
      detalle: `${error.message}`,
    });
  }
});

// Ruta para actualizar un producto por su ID (pid)
router.put("/:pid", async (req, res) => {
  const { pid: productId } = req.params;
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) {
    return res.status(400).json({ error: "ID del producto inválido" });
  }

  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  if (updates.id) {
    return res
      .status(400)
      .json({ error: "No se puede actualizar el ID del producto" });
  }

  try {
    const updatedProduct = await ProductsManager.updateProduct(
      parsedProductId,
      updates
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar el producto:", error.message);
    res
      .status(500)
      .json({ error: `Error al actualizar el producto: ${error.message}` });
  }
});

// Ruta para eliminar un producto por su ID (pid)
router.delete("/:pid", async (req, res) => {
  const { pid: productId } = req.params;
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) {
    return res.status(400).json({ error: "ID del producto inválido" });
  }

  try {
    const result = await ProductsManager.deleteProduct(parsedProductId);

    if (result === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar el producto:", error.message);
    res
      .status(500)
      .json({ error: `Error al eliminar el producto: ${error.message}` });
  }
});

module.exports = router;
