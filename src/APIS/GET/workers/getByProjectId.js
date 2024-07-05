const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const Worker = require('../../../modules/worker/worker');
const Departments = require('../../../modules/departments/departments');

const router = express.Router();
const worker = new Worker()
const department = new Departments()

router.get(ENDPOINTS.GET.WORKER.BYPROJECTID, async (req, res) => {
    const department_id = req.query.department_id
    const company_id = req.params.company_id    
    const project_id = req.params.project_id    
    const perPage = req.query.per_page
    const user_id = req.params.user_id
    const search = req.query.search
    const page = req.query.page
    
    try {
        const WORKER_DATA = await worker.getByProjectId(project_id, search, department_id, page, perPage)
        const DEPARTEMENT_DATA = await department.get(company_id)
        
        res.status(200).json({
            data: WORKER_DATA[0],
            additional: DEPARTEMENT_DATA[0],
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