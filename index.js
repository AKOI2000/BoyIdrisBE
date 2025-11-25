import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./auth/passport.js";

import postRoutes from "./routes/workRoutes.js";
import authRoutes from "./routes/auth.js";
import clients from "./routes/client.js";
import experience from "./routes/experience.js";
import { PGStore } from "connect-pg-simple";
import pool from "./db.js";

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

const pgSession = PGStore(session);

const sessionMiddleware = session({
  store: new pgSession({
    pool,                 // your existing pg Pool
    tableName: "session", // optional
    createTableIfMissing: true, // auto-create the table
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // or 'none' if frontend is on a different domain
    httpOnly: true,
  },
});

app.use(sessionMiddleware);


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
