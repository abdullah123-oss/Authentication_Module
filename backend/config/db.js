import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (err) {
    console.log("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};
