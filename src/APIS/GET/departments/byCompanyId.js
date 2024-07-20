const Summary = require('../../../modules/attendance/summary');
const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const Departments = require('../../../modules/departments/departments');
const security = require('../../../middleware/security');

const router = express.Router();
const departments = new Departments()

router.get(ENDPOINTS.GET.DEPARTMENTS.BYCOMPANYID, async (req, res) => {
    const page = req.query.page
    const perPage = req.query.per_page
    
    try {
        const company_id = await security.decrypt(req.params.company_id)
        const DATA = await departments.get(company_id)

        res.status(200).json({
            data: DATA,
            meta: {
                page: parseInt(page) + 1,
                per_page: perPage,
                total_pages: DATA.length % perPage
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