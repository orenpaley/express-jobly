"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      console.log('AUTH HEADER AUTH HEADER', authHeader)
      // in case the word bearer was including when setting authorization at load,
      //  it will be removed from 
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }s
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must have admin status.
 *
 * If not, raises Unauthorized.
 */


function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    if (!res.locals.user.isAdmin) throw new UnauthorizedError();
    return next()
  }
  catch (err) {
    return next(err)
  }
}

/** Middleware to use when they must be the current user of the request or admin
 *
 * If not, raises Unauthorized.
 */


function ensureAdminOrCurUser(req, res, next) {
  try {
    console.log("RES LOCALS USER RES LOCALS USER REAL REAL", res.locals.user)
    if ((res.locals.user.username) == String(req.params.username)) return next()
    if (res.locals.user.isAdmin) return next()
    throw new UnauthorizedError()
  }
  catch (err) {
    return next(err)
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin, 
  ensureAdminOrCurUser
};
