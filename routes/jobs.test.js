"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  let newJob = {
    title: "j999",
    salary: 200000,
    equity: "0.020",
    companyHandle: "c2",
  };

  let badJob = {
    title: "j00001",
    salary: "200000",
    equity: 0.2,
    companyHandle: 22,
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    console.log("RESP RESP RESP RESP", resp);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: { ...newJob, id: expect.any(Number) },
    });
  });

  test("not ok for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 60000,
        equity: "0.10",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(badJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    console.log("JOBS JOBS JOBS JOBS", resp.body);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: expect.any(String),
          equity: expect.any(String),
          salary: expect.any(Number),
          companyHandle: expect.any(String),
          companyName: expect.any(String),
        },
        {
          id: expect.any(Number),
          title: expect.any(String),
          equity: expect.any(String),
          salary: expect.any(Number),
          companyHandle: expect.any(String),
          companyName: expect.any(String),
        },
        {
          id: expect.any(Number),
          title: expect.any(String),
          equity: expect.any(String),
          salary: expect.any(Number),
          companyHandle: expect.any(String),
          companyName: expect.any(String),
        },
      ],
    });
  });

  test("works with all filters", async function () {
    const filters = { minSalary: 22500, title: "j", hasEquity: true };
    const resp = await request(app)
      .get("/jobs")
      .query(filters)
      .set("authorization", `Bearer${u1Token}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: expect.any(String),
          equity: expect.any(String),
          salary: expect.any(Number),
          companyHandle: expect.any(String),
          companyName: expect.any(String),
        },
      ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    console.log("TEST JOB IDS TEST JOB IDS", testJobIds[0]);
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    console.log("formtat for job get", resp.body);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "j21",
        salary: 21000,
        equity: "0.21",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          logoUrl: "http://c1.img",
          numEmployees: 1,
        },
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/-5`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "job-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "job-new",
        salary: expect.any(Number),
        equity: expect.any(String),
        companyHandle: expect.any(String),
      },
    });
  });
  test("does not work for user", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "Job2-new",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send({
      title: "job3-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/-43`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: String(testJobIds[0]) });
  });

  test("does not work for user", async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
  test("does not work for anon", async function () {
    const resp = await request(app).delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/-7`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
