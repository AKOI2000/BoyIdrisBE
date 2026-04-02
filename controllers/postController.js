import cloudinary from "../cloudinary.js";
import pool from "../db.js";
import streamifier from "streamifier";
import slugify from "slugify";

export const createPost = async (req, res) => {
  const { title, description, tags } = req.body;
  const files = req.files;

  if (!title || !files || files.length === 0)
    return res
      .status(400)
      .json({ success: false, message: "Missing title or images" });

  const uploadBufferToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "photographer_uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  };

  try {
    const imageUrls = await Promise.all(files.map(uploadBufferToCloudinary));
  } catch (err) {
    // handle it — one or more uploads failed
    return res.status(500).json({ message: err.message });
  }

  const slug = slugify(title, { lower: true, strict: true });

  const insertQuery = `
      INSERT INTO posts (title, description, tags, images, slug)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

  const values = [title, description, tags, JSON.stringify(imageUrls), slug];

  const result = await pool.query(insertQuery, values);

  // return res.status(201).json({ success: true, post: result.rows[0] });
};
