const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const Worker = require('../../../modules/worker/worker');
const Departments = require('../../../modules/departments/departments');

const router = express.Router();
const worker = new Worker()
const department = new Departments()

router.get(ENDPOINTS.GET.WORKER.GETID, async (req, res) => {
    const id = req.query.id    
    
    try {

        const DATA = await worker.getId(id)
        
        res.status(200).json({
            data: DATA == 1 ? true : false,            
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router ;