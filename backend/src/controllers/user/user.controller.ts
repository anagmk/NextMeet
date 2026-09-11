import { Request, Response } from "express";
import User from "../../models/user.model.js";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, profileImage, bio, skills, experience } = req.body ?? {};

    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      user.name = trimmedName;
    }

    if (typeof bio === "string") {
      user.bio = bio.trim().slice(0, 500);
    }

    if (typeof profileImage === "string") {
      const imageValue = profileImage.trim();
      user.profileImage = imageValue;
    }

    if (Array.isArray(skills)) {
      user.skills = skills
        .map((skill) => String(skill).trim())
        .filter(Boolean)
        .slice(0, 20);
    } else if (typeof skills === "string") {
      user.skills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 20);
    }

    if (typeof experience !== "undefined") {
      const numericExperience = Number(experience);
      if (!Number.isFinite(numericExperience) || numericExperience < 0) {
        return res.status(400).json({ message: "Experience must be a non-negative number" });
      }
      user.experience = numericExperience;
    }

    if (user.authProvider !== "google" && typeof email === "string") {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }

      const existingUser = await User.findOne({ email: trimmedEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      user.email = trimmedEmail;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
