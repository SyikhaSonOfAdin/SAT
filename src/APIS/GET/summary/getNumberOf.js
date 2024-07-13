const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');

const router = express.Router();
const summary = new Summary()

router.get(ENDPOINTS.GET.SUMMARY.NUMBER_OF, async (req, res) => {
    const company_id = req.params.company_id
    const project_id = req.params.project_id
    
    try {
        const DEPARTMENTS = await summary.getNumberDepartments(company_id)
        const WORKERS = await summary.getNumberWorkers(project_id)
        const UNREGISTERED_WORKERS = await summary.getNumberUnregisteredWorkers()
        
        res.status(200).json({
            departments: DEPARTMENTS[0],           
            workers: WORKERS[0],           
            unregistered_workers: UNREGISTERED_WORKERS[0],           
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router ;