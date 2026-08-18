import { Request, Response } from "express";
import User from "../../models/user.model.js";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { _id?: string } | undefined)?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await User.findById(userId).select("-password");
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  }catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
