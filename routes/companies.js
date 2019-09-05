const express = require("express");
const router = new express.Router();
const db = require("../db")
const app = require("../app")
const ExpressError = require("../expressError")

const companies = [];

router.get("/", async function (req, res) {
  const results = await db.query(`
    SELECT code, name FROM companies`
  );

  res.json({ companies: results.rows })
});

router.get("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    console.log(code);

    const results = await db.query(
      `SELECT * FROM companies
      WHERE code=$1`, [code]);

    return res.json(results.rows)

  }

  catch (err) {
    return next(err)
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { code, name, description } = req.body

    const result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
      [code, name, description]);

    return res.status(201).json(result.rows[0]);

  }

  catch (err) {
    return next(err);
  }
});

router.put("/:code", async function (req, res, next) {
  try {
    const { name, description } = req.body

    const result = await db.query(`
      UPDATE companies SET name=$1, description=$2
      WHERE code=$3
      RETURNING name, description`, [name, description, req.params.code]);

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      throw new ExpressError("company not found", 404)
    }

  }

  catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    const result = await db.query(`
    DELETE FROM companies WHERE code=$1`,
      [req.params.code]
    );

    console.log(result);
    if (result.rowCount > 0) {
      return res.json({ message: "Deleted" });
    } else {
      throw new ExpressError("company not found", 404);
    }
  }

  catch (err) {
    return next(err);
  }
});

module.exports = router;