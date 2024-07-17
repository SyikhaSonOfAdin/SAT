const SubDepartment = require("../../../modules/departments/subDepartment");
const ENDPOINTS = require("../../../.conf/endpoints");
const express = require('express');
const router = express.Router();

const subDepartment = new SubDepartment();


router.post(ENDPOINTS.POST.SUB_DEPARTMENTS.ADD,  async (req, res) => {
    const { department_id, user_id, name } = req.body

    try {
        await subDepartment.add(department_id, user_id, name)
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {        
        console.log(error.message)
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
});

module.exports = router ;