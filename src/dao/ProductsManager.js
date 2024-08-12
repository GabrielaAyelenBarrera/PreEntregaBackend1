const fs = require("fs");
const CartsManager = require("./CartsManager");

class ProductsManager {
  static path = "./src/data/products.json";

  //AGREGADO
  // Crear un nuevo producto
  static async create(producto = {}) {
    const {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails = [],
    } = producto;

    // Validar que los campos obligatorios estén presentes
    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error(
        "Todos los campos obligatorios (title, description, code, price, stock, category) deben estar presentes."
      );
    }

    // Obtener los productos actuales
    let productos = await this.getProducts();

    // Verificar si el código del producto ya existe
    let existe = productos.find((p) => p.code === code);
    if (existe) {
      throw new Error(
        `El producto con el código ${code} ya existe en la base de datos.`
      );
    }

    // Asignar un nuevo ID al producto
    let id = 1;
    if (productos.length > 0) {
      id = Math.max(...productos.map((p) => p.id)) + 1;
    }

    //AÑADIDO ACA Y  ABAJO
let carritoID=await CartsManager.create()

    // Crear el nuevo producto
    let nuevoProducto = {
      id,
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
      status: true, // Status por defecto en true
      carritoID
    };

    // Agregar el nuevo producto a la lista
    productos.push(nuevoProducto);

    // Guardar la lista actualizada de productos en el archivo
    await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 2));

    return nuevoProducto;
  }

  // Método auxiliar para leer productos del archivo
  static async readProductsFromFile() {
    try {
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, {
          encoding: "utf-8",
        });
        return JSON.parse(data);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error al leer el archivo de productos:", error);
      throw new Error("Error al leer el archivo de productos");
    }
  }

  // Método auxiliar para escribir productos al archivo
  static async writeProductsToFile(products) {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    } catch (error) {
      console.error("Error al escribir en el archivo de productos:", error);
      throw new Error("Error al escribir en el archivo de productos");
    }
  }

  // Método para obtener todos los productos
  static async getProducts() {
    try {
      const products = await this.readProductsFromFile();
      console.log("Productos obtenidos con éxito.");
      return products.map((p) => ({
        ...p,
        title: p.title || "No Title",
        description: p.description || "No Description",
      }));
    } catch (error) {
      console.error("Error al obtener los productos:", error.message);
      throw new Error("Error al obtener los productos");
    }
  }

  // Actualiza un producto existente
  static async updateProduct(id, updatedProduct = {}) {
    try {
      const products = await this.getProducts();
      const index = products.findIndex((p) => p.id === id);

      if (index === -1) {
        console.error(`Error: Producto con ID ${id} no encontrado`);
        throw new Error(`Error: Producto con ID ${id} no encontrado`);
      }

      products[index] = { ...products[index], ...updatedProduct };
      await this.writeProductsToFile(products);
      console.log(
        `Producto actualizado con éxito: ${JSON.stringify(products[index])}`
      );
      return products[index];
    } catch (error) {
      console.error("Error al actualizar el producto:", error.message);
      throw new Error("Error al actualizar el producto");
    }
  }

  // Elimina un producto
  static async deleteProduct(id) {
    try {
      const products = await this.getProducts();
      const updatedProducts = products.filter((p) => p.id !== id);

      if (updatedProducts.length === products.length) {
        console.error(`Error: Producto con ID ${id} no encontrado`);
        throw new Error(`Error: Producto con ID ${id} no encontrado`);
      }

      await this.writeProductsToFile(updatedProducts);
      console.log(`Producto eliminado con éxito. ID: ${id}`);
      return 1;
    } catch (error) {
      console.error("Error al eliminar el producto:", error.message);
      throw new Error("Error al eliminar el producto");
    }
  }
}

module.exports = ProductsManager;
