const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const Departments = require('../../../modules/departments/departments');
const security = require('../../../middleware/security');

const router = express.Router();
const summary = new Summary()
const department = new Departments()

router.get(ENDPOINTS.GET.WORKER.UNREGISTERED_WORKERS, async (req, res) => {
    
    try {
        const company_id = await security.decrypt(req.params.company_id)
        const DATA = await summary.getUnregisteredWorkers()
        const ADDITIONAL = await department.get(company_id)

        res.status(200).json({
            data: DATA[0],
            additional: ADDITIONAL[0],
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router;