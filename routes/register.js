const bcrypt = require('bcryptjs');
const _ = require('lodash');
const empty = require('is-empty')
const { generateAuthToken, validateRegistration } = require('../models/user')
const constants = require('../utils/constants')
const { doQuery } = require('../db');
const express = require('express');
const router = express.Router();

// Register New User
router.post('/', async (req, res) => {
    // Validate information in request
    const { error } = validateRegistration(req.body);
    if(error) return res.status(400).send(`Bad Request: ${error.details[0].message}`);

    // Make sure email isn't already 
    // registered in proper database table!!
    let user = {};
    let query = `SELECT * FROM ${constants.userTypeToTableName(req.body.userType)} u WHERE u.email='${req.body.email}';`;
    let params = [];
    doQuery(res, query, params, function(data) {
        // TODO - this isn't working properly
        user = data.recordset;
    });
    // TODO - this isn't working properly
    if (!empty(user)) return res.status(400).send(`Bad Request: E-mail already registered.`);

    // Protect the password, salt and hash it!
    const salt = await bcrypt.genSalt(11);
    user.pword = await bcrypt.hash(user.pword, salt);

    // Save new user to correct database table!
    query = `INSERT INTO ${constants.userTypeToTableName(req.body.userType)}
    VALUES ('${req.body.email}', '${req.body.pword}', '${req.body.fName}', '${req.body.lName}', '${req.body.phoneNumber}')`
    doQuery(res, query, params, function(data) { 
        // Do we need to do anything here? 
    });

    // Build user for auth token and return response
    user = {
        "id": user['id'],
        "email": req.body.email,
        //"pword": req.body.pword,
        "fName": req.body.fName,
        "lName": req.body.lName,
        "phoneNumber": req.body.phoneNumber,
        "userType": req.body.userType,
    };

    // Return authenication token and created user object
    const token = generateAuthToken(user);
    res.header(constants.TOKEN_HEADER, token).send(_.pick(user, ['_id', 'email', 'fName', 'lName', 'phoneNumber', 'userType']));
});

module.exports = router;