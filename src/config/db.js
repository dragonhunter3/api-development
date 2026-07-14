const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to resolve SRV records using public DNS servers (fixes querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '1.1.1.1']);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB: Using cached database connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mvc-auth-db');
    isConnected = db.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;
