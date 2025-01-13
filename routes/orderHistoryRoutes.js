const express = require('express');
const { checkAuthorization, checkCommonUserAuthentication } = require('../middleware/Authorization');

const router = express.Router();

router.get('/:id', checkAuthorization, checkCommonUserAuthentication, getOrderHistory)

module.exports = router;