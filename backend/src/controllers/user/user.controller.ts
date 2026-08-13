import User from "../../models/user.model";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
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