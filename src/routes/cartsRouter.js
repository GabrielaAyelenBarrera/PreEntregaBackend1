const express = require("express");
const router = express.Router();
const CartsManager = require("../dao/CartsManager.js"); 

const cartsManager = new CartsManager('path/to/carts.json'); // Define la ruta del archivo

router.get('/', async (req, res) => {
  try {
    const carts = await CartsManager.getCarts();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const cartId = await CartsManager.create();
    res.status(201).json({ message: 'Carrito creado', id: cartId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener un carrito por ID
router.get('/:id', async (req, res) => {
  try {
    const cart = await cartsManager.getCartById(req.params.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para agregar un producto a un carrito específico
router.post('/:id/products', async (req, res) => {
  try {
    const cart = await CartsManager.addProductToCart(req.params.id, req.body);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un producto de un carrito específico
router.delete('/:id/products/:productId', async (req, res) => {
  try {
    const removed = await CartsManager.removeProductFromCart(req.params.id, req.params.productId);
    if (removed) {
      res.json({ message: 'Producto eliminado del carrito' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un carrito por ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CartsManager.deleteCart(req.params.id);
    if (deleted) {
      res.json({ message: 'Carrito eliminado' });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;