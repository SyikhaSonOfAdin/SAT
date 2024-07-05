const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');

const router = express.Router();
const summary = new Summary()

router.get(ENDPOINTS.GET.SUMMARY.BYDATE, async (req, res) => {
    const user_id = req.params.user_id    
    const project_id = req.params.project_id
    const date = req.query.date    
    
    try {
        const DATA = await summary.getSummary(date)
        
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