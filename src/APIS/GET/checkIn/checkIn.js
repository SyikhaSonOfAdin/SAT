const ENDPOINTS = require('../../../.conf/endpoints');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');

const router = express.Router();
const checkin = new CheckIn()

router.get(ENDPOINTS.GET.CHECKIN, async (req, res) => {
    const user_id = req.params.user_id    
    const project_id = req.params.project_id    
    const page = req.query.page    
    const perPage = req.query.per_page    
    const name = req.query.name    
    
    try {
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