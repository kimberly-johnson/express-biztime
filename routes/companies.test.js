process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
  let result = await db.query(`
    INSERT INTO 
    companies (code, name, description) 
    VALUES ('rithm', 'RITHM', 'a place where we learn stuff')
    RETURNING code, name
    `);
  testCompany = result.rows[0];
});

afterEach(async function () {
  await db.query("DELETE FROM companies");
});

describe("GET /companies", function () {
  it("Gets a list of companies", async function () {
    const resp = await request(app).get('/companies');
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      companies: [ testCompany ]
    });
  });
});

afterAll(async function () {
  // close db connection
  await db.end();
});