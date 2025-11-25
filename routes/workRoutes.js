import express from "express";
import multer from "multer";
import { createPost } from "../controllers/postController.js";
import streamifier from "streamifier";
import pool from "../db.js";
import slugify from "slugify";

const router = express.Router();

// Multer will hold files temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for creating post with multiple images
router.post("/work/create", upload.array("images", 15), createPost);

router.get("/allworks", async (req, res) => {
  const result = await pool.query("SELECT * FROM posts");
  const works = result.rows;
  res.json(works)
})

router.get("/works", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  if (page === 0) return (page = 1);
  const limit = 12;
  const offset = (page - 1) * limit;

  const total = await pool.query("SELECT COUNT(*) FROM posts");

  const posts = await pool.query(
    "SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );

  if (total) {
    if (Math.ceil(total.rowCount / limit) < page) {
      console.log("Unsuccessful");
      res.json(
        {message: "Hey champ, I have not done just enough work,thank you for believing in me though"}
      );
    } else {
      console.log("Successful");
      res.json({
        data: posts.rows,
        pagination: {
          total: parseInt(total.rows[0].count),
          page,
          limit,
          totalPages: Math.ceil(total.rows[0].count / limit),
        },
      });
    }
  }
});

router.get("/work/:slug", async (req, res) => {
  const slug = req.params.slug;
  const result = await pool.query("SELECT * FROM posts WHERE slug=$1", [slug]);
  const data = result.rows[0];

  if (data.length < 1) {
    res.json("Error getting this work");
  } else {
    res.json(data);
  }
});

router.delete("/work/delete/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const result = await pool.query("DELETE FROM posts WHERE slug=$1", [slug]);
    res.json("Deleted successfully");
  } catch (error) {
    res.json("Error deleting");
    console.log(error);
  }
});

router.patch("/work/edit/:slug", async (req, res) => {
  const slug = req.params.slug;
  const { title, description, tags } = req.body;
  const newSlug = slugify(title, { lower: true, strict: true });
  const result = await pool.query(
    "UPDATE posts SET title = $1, description = $2, tags=$3, slug=$4 WHERE slug = $5 RETURNING *",
    [title, description, tags, newSlug, slug]
  );
  if (result.rows.length < 1) {
    res.json("Error editing the work");
  } else {
    res.json("Edited successfully");
  }
});

export default router;
