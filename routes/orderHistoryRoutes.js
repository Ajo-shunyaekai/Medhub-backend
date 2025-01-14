const express = require('express');
const { checkAuthorization, checkCommonUserAuthentication } = require('../middleware/Authorization');
const {getOrderHistory} = require('../controller/orderHistory')

const router = express.Router();

router.post('/:id', checkAuthorization, checkCommonUserAuthentication, getOrderHistory)

module.exports = router;