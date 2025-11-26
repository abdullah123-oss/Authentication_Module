import express from "express";
import { updateProfile, uploadPicture } from "../controllers/profileController.js";
import { uploadProfilePic } from "../middlewares/upload.js";
import {verifyToken as protect} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Update profile info
router.put("/update", protect, updateProfile);

// Upload profile picture
router.post(
  "/upload-picture",
  protect,
  uploadProfilePic.single("profilePic"),
  uploadPicture
);

export default router;
