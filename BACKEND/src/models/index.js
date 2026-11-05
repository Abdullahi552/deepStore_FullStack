// Import all models once so Mongoose registers them in a single place.
// Any file can `import { User, Product, ... } from '../models/index.js'`
// and be guaranteed that cross-model refs (populate, etc.) resolve.
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Cart from './Cart.js';
import Order from './Order.js';

export { User, Category, Product, Cart, Order };