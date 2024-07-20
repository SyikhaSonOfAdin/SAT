const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const Worker = require('../../../modules/worker/worker');
const Departments = require('../../../modules/departments/departments');
const security = require('../../../middleware/security');

const router = express.Router();
const worker = new Worker()
const department = new Departments()

router.get(ENDPOINTS.GET.WORKER.BYPROJECTID, async (req, res) => {
    const department_id = req.query.department_id
    const perPage = req.query.per_page
    const search = req.query.search
    const page = req.query.page
    
    try {
        const company_id = await security.decrypt(req.params.company_id)    
        const project_id = await security.decrypt(req.params.project_id)    
        const WORKER_DATA = await worker.getByProjectId(project_id, search, department_id, page, perPage)
        const DEPARTEMENT_DATA = await department.get(company_id)
        
        res.status(200).json({
            data: WORKER_DATA[0],
            additional: DEPARTEMENT_DATA,
            meta: {
                page: parseInt(page) + 1,
                per_page: perPage,
                total_pages: WORKER_DATA[0].length % perPage
            }
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router ;