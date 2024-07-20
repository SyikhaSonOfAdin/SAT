const ENDPOINTS = require("../../../.conf/endpoints");
const Departments = require("../../../modules/departments/departments");
const express = require('express');
const router = express.Router();

const departments = new Departments();


router.post(ENDPOINTS.POST.DEPARTMENTS.DELETE,  async (req, res) => {
    const { department_id } = req.body

    try {
        await departments.delete(department_id)
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {  
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
});

module.exports = router ;