const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  console.log(`[db] connected -> ${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });

  return mongoose.connection;
}

module.exports = connectDB;
