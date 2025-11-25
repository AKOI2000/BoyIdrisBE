import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get('/clients', async (req, res)=> {
    const result = await pool.query("SELECT * FROM clients");
    const data = result.rows;

    res.json(data);
});


router.post('/clients', async (req, res) => {
    const client = req.body.client;
    const result = await pool.query("INSERT INTO clients (client) VALUES ($1)", [client]);

    res.json({ success: true, message: "Sucessfully posted"});
});


router.get('/client/edit/:id', async (req, res)=> {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM clients WHERE id=$1", [id]);
    const data = result.rows[0];


    res.json(data);
})

router.post('/client/edit/:id', async (req, res) => {
    const id = req.params.id;
    const client = req.body.client;
    const result = await pool.query('UPDATE clients SET client = $1 WHERE id= $2', [client, id]);
    res.json("Edit successful");
})
router.delete('/client/delete/:id', async (req, res)=> {
    const id = req.params.id;
    const result = await pool.query("DELETE FROM clients WHERE id=$1", [id]);
}) 

export default router;