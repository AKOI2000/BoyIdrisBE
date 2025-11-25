import express from "express";
import passport from "../auth/passport.js";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Check if logged in
router.get("/check", (req, res) => {
  if (req.isAuthenticated()) return res.json({ loggedIn: true, user: req.user });
  res.json({ loggedIn: false });
});

// Login
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ success: false, message: info.message });
  
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ success: true, user });
      });
    })(req, res, next);
});
  

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existingUser.rows.length > 0) return res.json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 15);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES($1, $2) RETURNING *",
      [email, hashed]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

export default router;
