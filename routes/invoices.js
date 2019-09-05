const express = require("express");
const router = new express.Router();
const db = require("../db")
const app = require("../app")
const ExpressError = require("../expressError")

router.get('/', async function (req, res, next) {
  const results = await db.query(
    `SELECT id, comp_code FROM invoices`
  );
  return res.json({ invoices: results.rows })
});


router.get('/:id', async function (req, res, next) {
  try {
    const invoiceResults = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id=$1`, [req.params.id]);
    const companyResults = await db.query(
      `SELECT code, name, description 
      FROM companies 
      WHERE code=$1`, [invoiceResults.rows[0].comp_code]
    )

    return res.json({ invoice: invoiceResults.rows, company: companyResults.rows });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(`
      INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`
      , [comp_code, amt]);

    return res.status(201).json(result.rows[0]);
  }
  catch (err) {
    return next(err);
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    const { amt } = req.body;
    const result = await db.query(
      `UPDATE invoices SET amt=$1
      WHERE id=$2
      RETURNING id, comp_code, amt, paid, add_date, paid_date
      `, [amt, req.params.id]);
    console.log("RESULT:", result);
    if (result.rows.length === 0) {
      throw new ExpressError("invoice not found", 404);
    }
    return res.json({ invoice: result.rows[0] });
  }
  catch (err) {
    return next(err);
  }
});


router.delete('/:id', async function (req, res, next) {
  try {
    const result = await db.query(`
      DELETE FROM invoices WHERE id=$1
    `, [req.params.id]);

    if (result.rowCount === 0) {
      throw new ExpressError("invoice not found", 404);
    }
    return res.json({ message: "Deleted" });
  }
  catch (err) {
    return next(err);
  }
});



module.exports = router;