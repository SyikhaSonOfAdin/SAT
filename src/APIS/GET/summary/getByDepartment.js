const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');

const router = express.Router();
const summary = new Summary()

router.get(ENDPOINTS.GET.SUMMARY.DEPARTMENT, async (req, res) => {
    const company_id = req.params.company_id
    const department_id = req.params.department_id
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    
    try {
        const DATA = await summary.getByDepartmentId(department_id, startDate, endDate)
        
        res.status(200).json({
            data: DATA[0],            
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router ;