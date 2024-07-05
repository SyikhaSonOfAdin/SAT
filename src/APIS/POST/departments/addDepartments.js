const ENDPOINTS = require("../../../.conf/endpoints");
const Security = require("../../../middleware/security");
const Departments = require("../../../modules/departments/departments");
const Project = require("../../../modules/project/project");
const express = require('express');
const router = express.Router();

const departments = new Departments();
const security = new Security()


router.post(ENDPOINTS.POST.DEPARTMENTS.ADD,  async (req, res) => {
    const { company_id, user_id, name } = req.body

    try {
        await departments.add(company_id, user_id, name)
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {        
        console.log(error.message)
        res.status(200).json({
            status: 'failed',
            info: error
        })
    }
});

module.exports = router ;