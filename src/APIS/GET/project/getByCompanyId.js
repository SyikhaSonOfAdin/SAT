const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const Departments = require('../../../modules/departments/departments');
const security = require('../../../middleware/security');
const Project = require('../../../modules/project/project');

const router = express.Router();
const departments = new Departments()
const projects = new Project()

router.get(ENDPOINTS.GET.PROJECTS.BY_COMPAYID, async (req, res) => {
    
    try {
        const company_id = await security.decrypt(req.params.company_id)
        const DATA = await projects.getByCompanyId(company_id)

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

module.exports = router;