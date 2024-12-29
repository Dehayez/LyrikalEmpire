const passport = require('passport');

// Remove the following lines if they exist
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Remove the GoogleStrategy configuration if it exists
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://www.example.com/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     // User.findOrCreate({ googleId: profile.id }, function (err, user) {
//     //   return done(err, user);
//     // });
//   }
// ));

module.exports = passport;