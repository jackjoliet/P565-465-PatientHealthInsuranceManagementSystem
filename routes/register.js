const { doQuery } = require('../db');
const { GenerateAuthToken, ValidateRegistration } = require('../models/user')
const constants = require('../utils/constants')
const bcrypt = require('bcryptjs');
const empty = require('is-empty')
const winston = require('winston');
const express = require('express');
const router = express.Router();

// Register New User
router.post('/', async (req, res) => {
    // Validate information in request
    const { error } = ValidateRegistration(req.body);
    if(error) return res.status(400).send({ error: error.details[0].message });

    
    // Make sure email isn't already registered in proper database table!!
    let user = {};
    let query = `SELECT * FROM ${constants.UserTypeToTableName(req.body.userType)} WHERE email='${req.body.email}';`;
    doQuery(res, query, [], async function(selectData) {
        user = empty(selectData.recordset) ? [] : selectData.recordset[0];
        if (!empty(user)) return res.status(400).send({ error: `E-mail already registered.` });

        // Protect the password, salt and hash it!
        const salt = await bcrypt.genSalt(11);
        user.pword = await bcrypt.hash(req.body.pword, salt);

        userData = {};
        query = `INSERT INTO patientMedicalData OUTPUT INSERTED.id DEFAULT VALUES`;
        doQuery(res, query, [], function(insertData) { 
            userData = empty(insertData.recordset) ? [] : insertData.recordset[0];

            // Save new user to correct database table!
            // With INSERT statement output populates insertData.recordset[0] with data that was used in query
            // Can do INSERTED.* for all info or INSERTED.*columnName* for retrieving specific data
            // Can chain these like: OUTPUT INSERTED.id, INSERTED.email, INSERTED.phonenumber
            query = `INSERT INTO ${constants.UserTypeToTableName(req.body.userType)} (email, pword, fname, lname, phonenumber)
            OUTPUT INSERTED.*
            VALUES ('${req.body.email}', '${user.pword}', '${req.body.fname}', '${req.body.lname}', '${req.body.phonenumber}');`

            doQuery(res, query, [], function(insertData) { 
                user = empty(insertData.recordset) ? [] : insertData.recordset[0];
                if(empty(user)) res.status(500).send("Failed to register user.")

                user = { "id": user['id'], "userType": req.body.userType, exp: 3600 };

                // Return authenication token and created user object
                const token = GenerateAuthToken(user);
                res.status(200).send({ token: token, id: user.id, userType: req.body.userType });
            });
        });
    });
});

module.exports = router;