import express from "express";
import pool from "../db.js";

const router = express.Router();


router.get('/experiences', async (req, res) => {
    const result = await pool.query('SELECT * FROM experience');
    const data = result.rows;

    res.json(data);
})

router.get('/experience/:id', async (req, res) => {
    const id = req.params.id;
    const result = await pool.query('SELECT * FROM experience WHERE id = $1', [id]);
    const data = result.rows[0];

    res.json(data);
})

router.post('/experience/create', async (req, res)=> {
    let {company, role, dateStart, dateEnd} = req.body;
    if (dateEnd == null) dateEnd = null

    const result = await pool.query('INSERT INTO experience (companyname, role, datestart, dateend) VALUES ($1, $2, $3, $4)', [company, role, dateStart, dateEnd]);

    res.json("Successful")
});

router.patch('/experience/edit/:id', async (req, res) => {
    const id = req.params.id;
    let {company, role, dateStart, dateEnd} = req.body;
    if (dateEnd == null) dateEnd = null

    const result = await pool.query('UPDATE experience SET companyname = $1, role = $2, datestart = $3, dateend = $4 WHERE id = $5', [company, role, dateStart, dateEnd, id]) 

    res.json("Successful")
})


router.delete('/experience/delete/:id', async (req, res) => {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM experience WHERE id = $1', [id])

    res.json("successful");
});




export default router;