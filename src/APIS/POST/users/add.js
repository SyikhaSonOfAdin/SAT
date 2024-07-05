const ENDPOINTS = require("../../../.conf/endpoints");
const Security = require("../../../middleware/security");
const express = require('express');
const Users = require("../../../modules/users/users");
const router = express.Router();

const users = new Users();
const security = new Security()


router.post(ENDPOINTS.POST.USERS.ADD, security.checkPassId, async (req, res) => {
    const { company_id, project_id, username, email, password, level } = req.body

    try {
        await users.add(company_id, project_id, username, email, password, level)
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error
        })
    }
});

module.exports = router ;