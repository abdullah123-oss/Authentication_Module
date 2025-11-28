import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};
