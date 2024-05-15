const Joi = require('joi');

module.exports = {
    validationSchema: Joi.object({
        first_name : Joi.string().trim().min(3).max(50).required(),
        last_name  : Joi.string().trim().min(1).max(50).required(),
        mobile_no  : Joi.string().pattern(new RegExp(/^\+\d{1,3}\s\d{6,14}$/)).required(),
        email      : Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'info']}}).required(),
        password   : Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required()
    })
}