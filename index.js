import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./auth/passport.js";

import postRoutes from "./routes/workRoutes.js";
import authRoutes from "./routes/auth.js";
import clients from "./routes/client.js";
import experience from "./routes/experience.js"

dotenv.config();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: "https://boyidris.vercel.app",
    credentials: true,
  })
);

// Session (must be before passport middleware)
app.use(
  session({
    secret: "something-super-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV || "production", // true in prod
      sameSite: "lax",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", postRoutes);
app.use("/admin", authRoutes);
app.use("/", clients)
app.use("/", experience)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
