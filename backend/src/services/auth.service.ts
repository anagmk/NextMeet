import User from "../models/user.model.js";

async function findOrCreateGoogleUser(profile: any) {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error("Google account has no email");
  }


  let user = await User.findOne({ googleId: profile.id });
  if (user) return user;


  user = await User.findOne({ email });
  if (user) {
    user.googleId = profile.id;
    if (!user.authProvider || user.authProvider === "local") {
      user.authProvider = "google"; 
    }
    await user.save();
    return user;
  }

  user = await User.create({
    googleId: profile.id,
    name: profile.displayName,
    email,
    profileImage: profile.photos?.[0]?.value,
    authProvider: "google",
  });

  return user;
}

export default {
  findOrCreateGoogleUser,
};