import User from "../models/User.js";

// ===== Update Profile Text Fields =====
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body; // name, bio, phone, etc.

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// ===== Upload Profile Picture =====
export const uploadPicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageURL = `/uploads/profilePics/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: imageURL },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile picture updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Upload picture error:", err);
    res.status(500).json({ message: "Server error uploading picture" });
  }
};
