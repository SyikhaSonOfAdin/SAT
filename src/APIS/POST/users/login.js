const ENDPOINTS = require('../../../.conf/endpoints')
const express = require('express');
const Users = require('../../../modules/users/users');
const router = express.Router();

const users = new Users() ;

router.post(ENDPOINTS.POST.USERS.LOGIN, async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await users.authentication(email, password) ;
        
        res.status(200).json({
            user
        })
    } catch (error) {
        res.status(200).json({
            success: false,
            info: error.message
        })
    }
})

module.exports = router ;
