const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const filePath = path.join(__dirname, '../data/carts.json');


class CartsManager {
  // Método para obtener todos los carritos desde el archivo
  static async getCarts() {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // Si el archivo no existe, devuelve un array vacío
      } else {
        throw new Error('Error al leer el archivo de carritos');
      }
    }
  }

  // Método para crear un nuevo carrito
  static async create() {
    const carts = await this.getCarts();
    const newCart = {
      id: uuidv4(),
      products: []
    };
    carts.push(newCart);
    await this.writeCartsToFile(carts);
    return newCart.id;
  }

  // Método para obtener un carrito por ID
  static async getCartById(cartId) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
    return cart;
  }

  // Método para añadir un producto a un carrito específico
  static async addProductToCart(cartId, product) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      throw new Error('Carrito no encontrado');
    }

    carts[cartIndex].products.push(product);
    await this.writeCartsToFile(carts);
    return carts[cartIndex];
  }

  // Método para eliminar un producto específico de un carrito
  static async removeProductFromCart(cartId, productId) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      throw new Error('Carrito no encontrado');
    }

    const productIndex = carts[cartIndex].products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return false; // Producto no encontrado
    }

    carts[cartIndex].products.splice(productIndex, 1);
    await this.writeCartsToFile(carts);
    return true; // Producto eliminado con éxito
  }

  // Método para eliminar un carrito específico por su ID
  static async deleteCart(cartId) {
    const carts = await this.getCarts();
    const updatedCarts = carts.filter(c => c.id !== cartId);

    if (carts.length === updatedCarts.length) {
      return false; // Carrito no encontrado
    }

    await this.writeCartsToFile(updatedCarts);
    return true; // Carrito eliminado con éxito
  }

  // Método auxiliar para escribir los carritos en el archivo
  static async writeCartsToFile(carts) {
    try {
      await fs.writeFile(filePath, JSON.stringify(carts, null, 2));
    } catch (error) {
      throw new Error('Error al escribir en el archivo de carritos');
    }
  }
}

module.exports = CartsManager;
