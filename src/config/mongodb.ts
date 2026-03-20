import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME

const mongoOptions: mongoose.ConnectOptions = {
  dbName: MONGODB_DB_NAME,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let isConnected = false;

export async function connectToMongoDB() {
  if (isConnected) {
    console.log('✓ MongoDB already connected');
    return mongoose.connection;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, mongoOptions);
    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${MONGODB_DB_NAME}`);
    return mongoose.connection;
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    isConnected = false;
    throw error;
  }
}

export function getMongoDBConnection() {
  return mongoose.connection;
}

export function isMongoDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export default mongoose;
