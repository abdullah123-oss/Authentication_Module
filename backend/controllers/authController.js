import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { generateOtp } from "../helpers/generateOtp.js";
import { hashPassword } from "../helpers/hashPassword.js";
import { comparePassword } from "../helpers/comparePassword.js";
import { createToken } from "../helpers/createToken.js";

// ---------------- SIGNUP ----------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required." });

    // Password validation (min 8 chars + 1 upper, 1 lower, 1 number, 1 special)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered." });

    // Hash password
    const hashed = await hashPassword(password);

    // Generate OTP and expiry
    const otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      otp,
      otpExpiry,
      isVerified: false,
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Verify your account — OTP",
      text: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your verification OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    res
      .status(201)
      .json({ message: "User created successfully. OTP sent to email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
};

// ---------------- VERIFY OTP ----------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Account verified. You can now log in." });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Update user with new OTP and expiry
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send new OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({ 
      message: "New OTP sent successfully" 
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ 
      message: "Error sending new OTP" 
    });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first." });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    const token = createToken({ id: user._id, role: user.role });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ---------------- FORGOT PASSWORD ----------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // Save OTP + expiry
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Reset Your Password - OTP",
      text: `Your OTP for resetting password is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP for resetting password is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    res.json({ message: "OTP sent to your email for password reset." });
  } catch (err) {
    console.error("Forgot Password error:", err);
    res.status(500).json({ message: "Server error during forgot password." });
  }
};

// ---------------- VERIFY RESET OTP ----------------
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // ✅ OTP valid → mark verified for reset (optional)
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "OTP verified. You can now reset your password." });
  } catch (err) {
    console.error("verifyResetOtp error:", err);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

// ---------------- RESET PASSWORD ----------------
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email and new password required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      });
    }

    // Hash new password
    const hashed = await hashPassword(newPassword);

    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Server error during password reset." });
  }
};
