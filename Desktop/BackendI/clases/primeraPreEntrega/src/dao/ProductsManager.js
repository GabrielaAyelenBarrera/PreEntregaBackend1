const fs = require('fs').promises;
const path = require("path");  
const CartsManager = require("./CartsManager");

const filePath = path.join(__dirname, '../data/products.json');

class ProductsManager {
  static async getProducts() {
    try {
      const data = await fs.readFile('src/data/products.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer los productos: ' + error.message);
      throw new Error("Error al leer los productos");
    }
  }

  static async getProductById(id) {
    try {
      const products = await ProductsManager.getProducts();
      return products.find(product => product.id === id);
    } catch (error) {
      throw new Error('Error al obtener el producto por ID: ' + error.message);
    }
  }

  static async create(product) {
    try {
      const products = await ProductsManager.getProducts();
      // Verificar si el producto ya existe
      const existingProduct = products.find(p => p.code === product.code);
      if (existingProduct) {
        throw new Error('El producto con el mismo código ya existe');
      }
      // Generar un nuevo ID para el producto
      const newId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
      const newProduct = { id: newId, ...product };
      products.push(newProduct);
      await fs.writeFile(filePath, JSON.stringify(products, null, 2));
      return newProduct;
    } catch (error) {
      throw new Error('Error al agregar el producto: ' + error.message);
    }
  }

  static async updateProduct(id, updates) {
    try {
      const products = await ProductsManager.getProducts();
      const productIndex = products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        return null;
      }
      // Actualizar el producto
      products[productIndex] = { ...products[productIndex], ...updates };
      await fs.writeFile(filePath, JSON.stringify(products, null, 2));
      return products[productIndex];
    } catch (error) {
      throw new Error('Error al actualizar el producto: ' + error.message);
    }
  }

  static async deleteProduct(id) {
    try {
      const products = await ProductsManager.getProducts();
      const newProducts = products.filter(p => p.id !== id);
      if (newProducts.length === products.length) {
        return 0; // Producto no encontrado
      }
      await fs.writeFile(filePath, JSON.stringify(newProducts, null, 2));
      return 1; // Producto eliminado
    } catch (error) {
      throw new Error('Error al eliminar el producto: ' + error.message);
    }
  }
}

module.exports = ProductsManager;