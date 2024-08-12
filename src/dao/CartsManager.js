const fs = require('fs'); 
const path = require("path"); 
const { v4: uuidv4 } = require("uuid");

// Clase para gestionar carritos de compras
class CartsManager {
  constructor(path) {
    this.path = path;
  }

  // Lee los carritos del archivo JSON
  static async readCartsFromFile() {
    try {
      await fs.stat(this.cartsFilePath);
      const data = await fs.readFile(this.cartsFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Si el archivo no existe, retornamos un array vacío
        return [];
      } else {
        console.error("Error al leer el archivo de carritos:", error);
        throw new Error("Error al leer el archivo de carritos");
      }
    }
  }

  // Escribe los carritos en el archivo JSON
  static async writeCartsToFile(carts) {
    try {
      await fs.writeFile(
        this.cartsFilePath,
        JSON.stringify(carts, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error("Error al escribir en el archivo de carritos:", error);
      throw new Error("Error al escribir en el archivo de carritos");
    }
  }

  // Agrega múltiples productos a un carrito específico
  static async addMultipleProductsToCart(cartId, products) {
    try {
      const carts = await this.readCartsFromFile();
      const cart = carts.find((c) => c.id === cartId); // Busca el carrito por ID

      if (!cart) {
        console.error(`Carrito con id ${cartId} no encontrado`);
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      // Convierte un solo producto en un array si es necesario
      if (!Array.isArray(products)) {
        if (
          typeof products !== "object" ||
          !products.productId ||
          !products.quantity
        ) {
          console.error(
            "El producto debe ser un objeto con productId y quantity"
          );
          throw new Error(
            "El producto debe ser un objeto con productId y quantity"
          );
        }
        products = [products];
      }

      // Verifica que el array de productos no esté vacío
      if (products.length === 0) {
        console.error(
          "El cuerpo de la solicitud debe ser un array de productos no vacío"
        );
        throw new Error(
          "El cuerpo de la solicitud debe ser un array de productos no vacío"
        );
      }

      // Recorre los productos y actualiza o añade la cantidad en el carrito
      products.forEach(({ productId, quantity }) => {
        if (
          !productId ||
          typeof productId !== "string" ||
          !quantity ||
          typeof quantity !== "number" ||
          quantity <= 0
        ) {
          console.error(
            "Cada producto debe tener productId (string) y una cantidad válida (número positivo)"
          );
          throw new Error(
            "Cada producto debe tener productId (string) y una cantidad válida (número positivo)"
          );
        }

        const productIndex = cart.products.findIndex(
          (p) => p.productId === productId
        );

        if (productIndex > -1) {
          // Actualiza la cantidad si el producto ya existe en el carrito
          cart.products[productIndex].quantity += quantity;
          console.log(
            `Cantidad actualizada para el producto ID ${productId} en el carrito ID ${cartId}`
          );
        } else {
          // Añade el producto si no existe en el carrito
          cart.products.push({ productId, quantity });
          console.log(
            `Producto añadido al carrito ID ${cartId}: ${JSON.stringify({
              productId,
              quantity,
            })}`
          );
        }
      });

      await this.writeCartsToFile(carts);
      return cart;
    } catch (error) {
      console.error("Error al agregar múltiples productos al carrito:", error);
      throw new Error("Error al agregar múltiples productos al carrito");
    }
  }

  // Obtiene un carrito específico por su ID
  static async getCartById(cartsManagerInstance, cartId) {
    try {
      const carts = await cartsManagerInstance.readCartsFromFile();
      const cart = carts.find((c) => c.id === cartId); // Busca el carrito por ID
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado.`);
      }
      return cart;
    } catch (error) {
      console.error("Error al obtener el carrito por ID:", error);
      throw new Error("Error al obtener el carrito por ID");
    }
  }

  // Obtiene los productos de un carrito específico por su ID
  static async getCartProducts(cartId) {
    try {
      const cart = await this.getCartById(cartId); // Obtiene el carrito
      return cart.products || []; // Devuelve los productos o un array vacío si no hay productos
    } catch (error) {
      console.error("Error al obtener los productos del carrito:", error);
      throw new Error("Error al obtener los productos del carrito");
    }
  }
   // Método para obtener los carritos desde el archivo
   static async getCarts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Si el archivo no existe, retornamos un array vacío
        return [];
      } else {
        throw error;
      }
    }
  }

  // Método para crear un nuevo carrito (instancia)
  static async create() {
    // Obtener los carritos actuales usando getCarts
    let carritos = await this.getCarts();

    // Asignar un nuevo ID al carrito
    let id = 1;
    if (carritos.length > 0) {
      id = Math.max(...carritos.map((c) => c.id)) + 1;
    }

    // Crear el nuevo carrito
    carritos.push({
      id,
      productos: [] // Lista de productos vacía por defecto
    });

    // Guardar la lista actualizada de carritos en el archivo
    await fs.promises.writeFile(this.path, JSON.stringify(carritos, null, 2));
    
    return id;
  }
 // Actualiza un carrito específico por su ID
 static async updateCart(id, cart={}) {
    const carts=await this.get()
    const index=carts.findIndex(c=>c.id===id) 
    if (index===-1){
      throw new Error(`Carrito con id ${id} no encontrado`);
    }
    // carts[index] = { ...carts[index], ...cart, id };  // Actualiza el carrito con los cambios
    carts[index]=cart
    await fs.promises.writeFile(this.path, JSON.stringify(carts,null, 5))
    return carts[index];}

  // Elimina un carrito específico por su ID
  static async deleteCart(id) {
    try {
      const carts = await this.readCartsFromFile();
      const newCarts = carts.filter((c) => c.id !== id); // Filtra el carrito a eliminar
      const deleted = carts.length !== newCarts.length; // Verifica si se eliminó algún carrito
      if (deleted) {
        await this.writeCartsToFile(newCarts);
      }
      return deleted;
    } catch (error) {
      console.error("Error al eliminar el carrito:", error);
      throw new Error("Error al eliminar el carrito");
    }
  }

  // Añade un producto a un carrito específico
  static async addProductToCart(cartId, product) {
    try {
      const carts = await this.readCartsFromFile();
      const cart = carts.find((c) => c.id === cartId); // Busca el carrito por ID
      if (!cart) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }
      if (
        !product ||
        !product.productId ||
        typeof product.quantity !== "number" ||
        product.quantity <= 0
      ) {
        throw new Error(
          "Producto inválido. Debe tener productId y una cantidad válida"
        );
      }

      const productIndex = cart.products.findIndex(
        (p) => p.productId === product.productId
      );
      if (productIndex > -1) {
        // Actualiza la cantidad si el producto ya existe en el carrito
        cart.products[productIndex].quantity += product.quantity;
      } else {
        // Añade el producto si no existe en el carrito
        cart.products.push(product);
      }

      await this.writeCartsToFile(carts);
      return cart;
    } catch (error) {
      console.error("Error al agregar el producto al carrito:", error);
      throw new Error("Error al agregar el producto al carrito");
    }
  }

  // Elimina un producto específico de un carrito
  static async removeProductFromCart(cartId, productId) {
    try {
      const carts = await this.readCartsFromFile();
      const cart = carts.find((c) => c.id === cartId); // Busca el carrito por ID
      if (!cart) {
        throw new Error(`Carrito con id ${cartId} no encontrado`);
      }

      const originalLength = cart.products.length;
      cart.products = cart.products.filter((p) => p.productId !== productId); // Filtra el producto a eliminar
      const removed = originalLength !== cart.products.length; // Verifica si se eliminó algún producto

      if (removed) {
        await this.writeCartsToFile(carts);
      }
      return removed;
    } catch (error) {
      console.error("Error al eliminar el producto del carrito:", error);
      throw new Error("Error al eliminar el producto del carrito");
    }
  }

}

module.exports = CartsManager;
