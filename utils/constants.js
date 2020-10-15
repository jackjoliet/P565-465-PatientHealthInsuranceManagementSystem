require('dotenv').config();

const DB_PASS = process.env.DB_PASS;
const JWT_SECRET = process.env.JWT_SECRET;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const AZURE_STORAGE_KEY = process.env.AZURE_STORAGE_KEY;
const TOKEN_HEADER = 'Authorization';
const USER_TYPES = {
    PATIENT: 'patient', //puser
    DOCTOR: 'doctor', //duser
    INSURANCEPROVIDER: 'insurance', //ipuser
}

function userTypeToTableName(userType){
    if(userType === USER_TYPES.PATIENT) return "patientUsers";
    else if(userType === USER_TYPES.DOCTOR) return "doctorUsers";
    else if(userType === USER_TYPES.INSURANCEPROVIDER) return "insuranceUsers";
    else return "ERROR";
}

// Regex Functions
// Test at regex101.com

const regexLettersOnly = new RegExp('^[a-zA-Z]{2,}$');
const regexPhoneNumber = new RegExp('^\\s*(?:\\+?(\\d{1,3}))?[-. (]*(\\d{3})[-. )]*(\\d{3})[-. ]*(\\d{4})(?: *x(\\d+))?\\s*$');

module.exports = {
	DB_PASS, JWT_SECRET, TOKEN_HEADER, GMAIL_PASSWORD, AZURE_STORAGE_KEY, USER_TYPES, userTypeToTableName, regexLettersOnly, regexPhoneNumber
}