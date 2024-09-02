const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');

const router = express.Router();
const checkin = new CheckIn()

router.get(ENDPOINTS.GET.SUMMARY.ATTENDANCE_PERFORMANCE, async (req, res) => {
    const user_id = req.params.user_id    
    const project_id = req.params.project_id
    const month = req.query.month    
    
    try {
        const [DATA] = await checkin.attendancePerformance(month)
        
        res.status(200).json({
            data: DATA,            
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router ;