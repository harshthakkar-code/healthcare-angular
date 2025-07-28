require('dotenv').config(); // Ensure this is at the top of your entry file (e.g., server.js)


const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
  // user login or creation logic
  done(null, profile);
}));
