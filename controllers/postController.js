import cloudinary from '../cloudinary.js';
import pool from '../db.js';
import streamifier from 'streamifier';
import slugify from "slugify";

export const createPost = async (req, res) => {
  console.log('⏳ createPost triggered');

  try {
    const { title, description, tags } = req.body;
    const files = req.files;

    console.log('Received:', { title, fileCount: files?.length });

    if (!title || !files || files.length === 0)
      return res.status(400).json({ success: false, message: 'Missing title or images' });

    const uploadBufferToCloudinary = (file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'photographer_uploads' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    };

    const imageUrls = await Promise.all(files.map(uploadBufferToCloudinary));
    // console.log('✅ Cloudinary URLs:', imageUrls);

    const slug = slugify(title, { lower: true, strict: true });

    const insertQuery = `
      INSERT INTO posts (title, description, tags, images, slug)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [title, description, tags, JSON.stringify(imageUrls), slug];
 

    // console.log('📥 Inserting into DB...');
    const result = await pool.query(insertQuery, values);
    // console.log('✅ Inserted:', result.rows[0]);

    return res.status(201).json({ success: true, post: result.rows[0] });
  } catch (error) {
    console.error('❌ createPost ERROR:', error);
    // respond even if error occurs
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      stack: error.stack,
    });
  }
};
