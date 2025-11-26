// backend/server.js
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/authRoute.js";
import testRoutes from "./routes/testRoute.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import publicDoctorRoutes from "./routes/publicDoctorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { stripeWebhookHandler } from "./controllers/paymentController.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { seedAdmin } from "./seed/adminSeeder.js"; 

dotenv.config();

const app = express();

/* ---------- Stripe webhook (raw body) ---------- */
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhookHandler
);

/* ---------- Normal middlewares ---------- */
app.use(cors());
app.use(express.json());

// Serve static uploaded images
app.use("/uploads", express.static("uploads"));


/* ---------- API routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/doctors", publicDoctorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
  res.send("Auth API is running...");
});

app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
seedAdmin(); // Seed admin user if not exists

/* ---------- HTTP + Socket.IO server ---------- */
const server = http.createServer(app);

export const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // frontend will send: { userId, role }
  socket.on("register", ({ userId, role }) => {
    if (!userId) return;

    console.log("📌 Socket registered:", { userId, role, socketId: socket.id });

    // personal room for this user
    socket.join(`user_${userId}`);

    // optional role-based rooms if you need them later
    if (role === "doctor") socket.join(`doctor_${userId}`);
    if (role === "patient") socket.join(`patient_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

/* ---------- Start listening ---------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
);

/* ---------- MongoDB connection ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));
