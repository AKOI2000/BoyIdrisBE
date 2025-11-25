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
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "none",
    secure: true,
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
