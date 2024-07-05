const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const Departments = require('../../../modules/departments/departments');

const router = express.Router();
const departments = new Departments()

router.get(ENDPOINTS.GET.DEPARTMENTS.BYCOMPANYID, async (req, res) => {
    const user_id = req.params.user_id
    const project_id = req.params.project_id
    const company_id = req.params.company_id
    const page = req.query.page
    const perPage = req.query.per_page

    try {
        const DATA = await departments.get(company_id)

        res.status(200).json({
            data: DATA[0],
            meta: {
                page: parseInt(page) + 1,
                per_page: perPage,
                total_pages: DATA[0].length % perPage
            }
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
})

module.exports = router;