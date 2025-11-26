import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
  const exists = await User.findOne({ role: "admin" });
  if (exists) {
    console.log("Admin already exists");
    return;
  }

  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  await User.create({
    name: "Super Admin",
    email: process.env.ADMIN_EMAIL,
    password: hashed,
    role: "admin",
    isVerified: true
  });

  console.log("Admin created successfully");
};
