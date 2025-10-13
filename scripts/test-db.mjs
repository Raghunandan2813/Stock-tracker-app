import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function testConnection() {
    if (!uri) {
        console.error("❌ MONGODB_URI is missing in .env file");
        process.exit(1);
    }

    try {
        console.log("⏳ Trying to connect to MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ MongoDB connected successfully!");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

testConnection();
