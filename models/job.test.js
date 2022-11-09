"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */


describe("create", function () {

  let newJob = {
        title: 'j99',
        salary: 200000,
        equity: '0.020', 
        companyHandle: "c2"
  }

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    console.log(jobs)
    expect(jobs).toEqual([
      {
        id: expect.any(Number), 
        title: 'j1',
        salary: 100000,
        equity: '0.010', 
        companyHandle: 'c1', 
        companyName: "C1"
      },
      {
        id: expect.any(Number), 
        title: 'j2',
        salary: 200000,
        equity: '0.020', 
        companyHandle: 'c2',
        companyName: "C2"
      },
      {
        id: expect.any(Number), 
        title: expect.any(String),
        salary: expect.any(Number),
        equity: expect.any(String), 
        companyHandle: expect.any(String) ,
        companyName: expect.any(String)
      },
      {  id: expect.any(Number),
        title: expect.any(String),
        salary: expect.any(Number),
        equity: expect.any(String), 
        companyHandle: expect.any(String), 
        companyName: expect.any(String)
      }
    ]);
  });
  test("works: with all filters", async function() {
    let filters = {title:"j3", minSalary: 150000, hasEquity: true}
    let jobs = await Job.findAll(filters)
    expect(jobs).toEqual([{
      id: expect.any(Number),
      title: "j3",
      salary: 300000,
      equity: '0.030', 
      companyHandle: 'c3',
      companyName: 'C3'
    }])
  })
  test("works: with one filter", async function() {
    let filters = {title:"j4"}
    let jobs = await Job.findAll(filters)
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j4",
        salary: 400000,
        equity: '0.040', 
        companyHandle: "c3", 
        companyName: "C3"
      }
    ])
  })
  test("works: returns empty from filters", async function() {
    let filters = {title:"zzzzzzzzzyyyyyyyxxxxx"}
    let jobs = await Job.findAll(filters)
    expect(jobs).toEqual([])
  })

test("works: returns empty from filters-min", async function() {
  let filters = {minSalary:10000000}
  let jobs = await Job.findAll(filters)
  expect(jobs).toEqual([])
})
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: expect.any(Number),
      title: 'j1',
      salary: 100000,
      equity: '0.010', 
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    title: "New",
    salary: 500,
    equity: "0.5",
  };
  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData,
    });


    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`, 
           [testJobIds[0]]);
    console.log(result.rows)
    expect(result.rows).toEqual([{
      id: expect.any(Number),
      title: "New",
      salary: 500, 
      equity: "0.5",
      company_handle: "c1",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  });
  



