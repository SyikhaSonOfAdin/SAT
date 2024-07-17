const SubDepartment = require("../../../modules/departments/subDepartment");
const ENDPOINTS = require("../../../.conf/endpoints");
const express = require('express');
const router = express.Router();

const subDepartment = new SubDepartment();


router.post(ENDPOINTS.POST.SUB_DEPARTMENTS.DELETE,  async (req, res) => {
    const { subDepartment_id } = req.body

    try {
        await subDepartment.delete(subDepartment_id)
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