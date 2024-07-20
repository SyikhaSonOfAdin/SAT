const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const security = require('../../../middleware/security');

const router = express.Router();
const checkin = new CheckIn()

router.get(ENDPOINTS.GET.CHECKIN, async (req, res) => {
    const page = req.query.page    
    const perPage = req.query.per_page    
    const name = req.query.name    
    
    try {
        const project_id = await security.decrypt(req.params.project_id)    
        const DATA = await checkin.getByName(project_id, name, page, perPage)
        
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

module.exports = router ;