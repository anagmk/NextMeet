import passport from "passport";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
import authService from "../services/auth.service.js";

const callbackURL = process.env.GOOGLE_CALLBACK_URL ?? process.env.GOOGLE_REDIRECT_URI;

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !callbackURL) {
  throw new Error(
    "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI."
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const user = await authService.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
