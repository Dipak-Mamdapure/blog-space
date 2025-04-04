import mongoose from 'mongoose';
import '../envConfig'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogspace';

export async function connectToDatabase() {
  try {
    console.log('[mongoose] Attempting to connect to MongoDB (attempt 1/3)...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
    });
    console.log('[mongoose] Successfully connected to MongoDB');
    return true;
  } catch (error) {
    console.error('[mongoose] Failed to connect to MongoDB:', error);
    
    // Retry connection
    try {
      console.log('[mongoose] Retrying connection to MongoDB (attempt 2/3)...');
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('[mongoose] Successfully connected to MongoDB on retry');
      return true;
    } catch (retryError) {
      console.error('[mongoose] Failed to connect on retry:', retryError);
      
      // Final attempt
      try {
        console.log('[mongoose] Final attempt to connect to MongoDB (attempt 3/3)...');
        await mongoose.connect(MONGODB_URI, {
          serverSelectionTimeoutMS: 15000, // Longer timeout for last attempt
        });
        console.log('[mongoose] Successfully connected to MongoDB on final attempt');
        return true;
      } catch (finalError) {
        console.error('[mongoose] All connection attempts to MongoDB failed:', finalError);
        return false;
      }
    }
  }
}

export function closeConnection() {
  return mongoose.connection.close();
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}