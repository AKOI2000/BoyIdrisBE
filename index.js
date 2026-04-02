import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./auth/passport.js";

import postRoutes from "./routes/workRoutes.js";
import authRoutes from "./routes/auth.js";
import clients from "./routes/client.js";
import experience from "./routes/experience.js";
import connectPgSimple from "connect-pg-simple";
import pool from "./db.js";

dotenv.config();

const app = express();

// CORS FIRST
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: "https://boyidris.vercel.app",
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust render proxy so secure cookies work
app.set("trust proxy", 2);

const pgSession = connectPgSimple(session);

const isProd = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
  store: new pgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    sameSite: isProd ? "none" : "lax",
    secure: isProd, // ONLY true in production
    httpOnly: true,
  },
});

app.use(sessionMiddleware);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", postRoutes);
app.use("/admin", authRoutes);
app.use("/", clients);
app.use("/", experience);

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
