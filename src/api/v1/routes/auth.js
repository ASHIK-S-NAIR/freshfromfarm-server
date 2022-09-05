const express= require('express');
const router= express.Router();

const {signup, login, logout} = require('../controllers/auth');

//signup
// @type POST
// @route /api/v1/signup
// @desc route to signup
// @access PUBLIC
router.post('/signup', signup);

//login
// @type POST
// @route /api/v1/login
// @desc route to login for all customers, employee and admin
// @access PUBLIC
router.post('/login', login);

//logout
// @type GET
// @route /api/v1/logout
// @desc route to logout for all customers, employee and admin
// @access PUBLIC
router.get('/logout', logout);

module.exports = router;