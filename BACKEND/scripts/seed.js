import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../src/config/env.js';
import { Category, Product, User } from '../src/models/index.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to DB');

    // Clear old data
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany({ email: 'admin@test.local' });

    // Create Admin User
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@test.local',
      passwordHash,
      role: 'admin',
    });
    console.log('👤 Created Admin: admin@test.local / password123');

    // Read JSON
    const rawData = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8');
    const productsData = JSON.parse(rawData);

    // Create Categories
    const uniqueCategoryNames = [...new Set(productsData.map(p => p.category))];
    const categoryMap = {};
    
    for (const catName of uniqueCategoryNames) {
      const cat = await Category.create({
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      categoryMap[catName] = cat._id;
    }
    console.log(`📁 Created ${uniqueCategoryNames.length} categories`);

    // Create Products
    const formattedProducts = productsData.map(p => ({
      name: p.name,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: p.description || '',
      price: p.priceCents, 
      images: [p.image], // Map frontend field to backend field
      category: categoryMap[p.category],
      stock: 50,
    }));

    await Product.insertMany(formattedProducts);
    console.log(`📦 Inserted ${formattedProducts.length} products`);

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDB();