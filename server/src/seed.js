require('dotenv').config();
const connectDB = require('./db');
const Dish = require('./models/Dish');
const seedData = require('./data/dishes.seed.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dish-dashboard';

async function seed() {
  await connectDB(MONGO_URI);

  await Dish.deleteMany({});
  const inserted = await Dish.insertMany(seedData);

  console.log(`[seed] inserted ${inserted.length} dishes`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
