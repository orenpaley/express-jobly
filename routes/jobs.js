"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, ensureAdminOrCurUser } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { id, title, salary, equity, company_handle}
 *
 * Returns { id, title, salary, equity, company_handle}
 *
 * Authorization required: login
 */

 router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    console.log("STARTING STARTING STARTING STARTING")
    const job = await Job.create(req.body);
    console.log("JOB", job)
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async function (req, res, next) {
  try {
    const q = req.query
    if (q.minSalary) {
      q.minSalary = +q.minSalary
    }
    if( q.hasEquity === true) {
      q.hasEquity = q.hasEquity === "true";
    }
  
    const jobs = await Job.findAll(q);
    console.log("JOBS JOBS JOBS JOBS", jobs)
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

 router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(Number(req.params.id));
    console.log('FORMAT OF A JOB GET WITH ID', job)
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

// include ensure loggied in into ensure admin remove array 
router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body,jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */

 router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

