"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const jobNewSchema = require("../schemas/jobNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();