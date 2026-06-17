import mongoose, { Connection } from 'mongoose';

let cachedConnection: Connection | null = null;

/**
 * Connect to MongoDB with caching to reuse connection
 */
export async function connectDB(): Promise<Connection> {
  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });

    cachedConnection = conn.connection;
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Close MongoDB connection (useful for cleanup)
 */
export async function disconnectDB(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
}
