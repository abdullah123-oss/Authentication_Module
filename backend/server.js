// backend/server.js
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import { connectDB } from "./config/db.js";        
import { seedAdmin } from "./seed/adminSeeder.js"; 

// Routes
import authRoutes from "./routes/authRoute.js";
import testRoutes from "./routes/testRoute.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import publicDoctorRoutes from "./routes/publicDoctorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { stripeWebhookHandler } from "./controllers/paymentController.js";

// Load environment variables
dotenv.config();

const app = express();

/* ------------------ STRIPE WEBHOOK (RAW BODY) ------------------ */
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhookHandler
);

/* ------------------ NORMAL MIDDLEWARES ------------------ */
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

/* ------------------ API ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/doctors", publicDoctorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("MedCare Backend API is running...");
});

/* ------------------ HTTP + SOCKET.IO SERVER ------------------ */
const server = http.createServer(app);

export const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("register", ({ userId, role }) => {
    if (!userId) return;

    console.log("📌 Socket registered:", { userId, role, socketId: socket.id });

    socket.join(`user_${userId}`);

    if (role === "doctor") socket.join(`doctor_${userId}`);
    if (role === "patient") socket.join(`patient_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

/* ------------------ START SERVER AFTER DB CONNECTS ------------------ */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    console.log("🚀 Database connected. Now seeding admin...");
    await seedAdmin();     // ✅ Only run seeder after DB is ready

    server.listen(PORT, () =>
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.log("❌ Failed to connect database", err);
  });
