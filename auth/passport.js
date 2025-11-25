import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pool from "../db.js";
import bcrypt from "bcrypt";

// Configure Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
    },
    async (email, password, done) => {
      try {
        const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        const user = result.rows[0];
        if (!user) return done(null, false, { message: "Email not registered" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Incorrect password" });

        return done(null, user); // user authenticated
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      "SELECT id, email FROM users WHERE id=$1",
      [id]
    );

    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});


export default passport;
