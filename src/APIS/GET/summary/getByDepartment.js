const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');

const router = express.Router();
const summary = new Summary()

router.get(ENDPOINTS.GET.SUMMARY.DEPARTMENT, async (req, res) => {
    const department_id = req.params.department_id
    const company_id = req.params.company_id
    const startDate = req.query.startDate
    const based_on = req.query.based_on
    const endDate = req.query.endDate
    const search = req.query.search
    const shift = req.query.shift

    const shiftData = ["All Shift", "Day Shift", "Night Shift"]
    const based_onData = ["Name", "Worker Id"]

    if (!shiftData.includes(shift) || !based_onData.includes(based_on)) {
        return res.status(400).json({
            message: 'Invalid Parameter'
        })
    }
    
    try {
        const DATA = await summary.getByDepartmentId(search, based_on, shift, department_id, startDate, endDate)
        
        res.status(200).json({
            data: DATA[0],            
        })
    } catch (error) {
        console.log(error.message)
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router ;