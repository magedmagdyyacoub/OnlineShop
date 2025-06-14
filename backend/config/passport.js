const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require("dotenv");
const pool = require("../config/db");

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/api/auth/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);

    if (existingUser.rows.length > 0) {
      return done(null, existingUser.rows[0]);
    }

    const newUser = await pool.query(
      "INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING *",
      [profile.displayName, profile.emails[0].value, profile.id]
    );

    return done(null, newUser.rows[0]);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  done(null, user.rows[0]);
});

passport.use(new FacebookStrategy({
    clientID: 'YOUR_FACEBOOK_APP_ID',
    clientSecret: 'YOUR_FACEBOOK_APP_SECRET',
    callbackURL: "http://localhost:5000/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name', 'displayName', 'picture.type(large)']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      const facebook_id = profile.id;

      let user = await pool.query("SELECT * FROM users WHERE facebook_id = $1", [facebook_id]);

      if (user.rows.length === 0) {
        // Insert new Facebook user
        const insertQuery = `
          INSERT INTO users (name, email, facebook_id, role_id)
          VALUES ($1, $2, $3, 2) RETURNING *
        `;
        const result = await pool.query(insertQuery, [name, email, facebook_id]);
        user = result;
      }

      done(null, user.rows[0]);
    } catch (err) {
      done(err, null);
    }
  }
));