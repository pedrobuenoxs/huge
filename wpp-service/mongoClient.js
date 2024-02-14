import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import pino from "pino";
dotenv.config();
import dotenv from "dotenv";

// MongoDB URI and Database Name
const mongoURI = process.env.MONGODB_URI;

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

async function connectToCluster(uri) {
  let mongoClient;

  try {
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("STATE: Connecting to MongoDB");
    await mongoClient.connect();
    logger.info("STATE: Successfully connected to MongoDB");
    return mongoClient;
  } catch (error) {
    logger.error("STATE: Connection to MongoDB failed!", error);
  }
}
const mongoClient = await connectToCluster(mongoURI);
// Export the model
export { mongoClient };

// Now you can use SomeModel to create, read, update, and delete documents in the 'SomeCollection' collection
