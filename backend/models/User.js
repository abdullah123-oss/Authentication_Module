import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
  // ----- BASIC AUTH -----
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.PATIENT,
  },

  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },

  // ----- PROFILE FIELDS (common for both roles) -----
  profilePic: {
    type: String, // image URL
    default: "",
  },

  phone: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  // ----- PATIENT SPECIFIC -----
  age: {
    type: Number,
    default: null,
  },

  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: "",
  },

  // ----- DOCTOR SPECIFIC -----
  specialization: {
    type: String,
    default: "",
  },

  experience: {
    type: Number, // years
    default: null,
  },

  clinicAddress: {
    type: String,
    default: "",
  },

  consultationFee: {
    type: Number,
    default: null,
  },

}, { timestamps: true });

export default mongoose.model("User", userSchema);
