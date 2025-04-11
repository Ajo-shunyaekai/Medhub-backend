const express = require('express');
const { checkAuthorization, authenticationNAuthorization } = require('../middleware/Authorization');
const {getOrderHistory} = require('../controller/orderHistory')

const router = express.Router();

router.post('/:id', checkAuthorization, authenticationNAuthorization, getOrderHistory)

module.exports = router;