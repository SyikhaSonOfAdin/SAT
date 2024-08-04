const ENDPOINTS = require("../../../.conf/endpoints");
const Security = require("../../../middleware/security");
const Company = require("../../../modules/company/company");
const express = require('express');
const router = express.Router();

const company = new Company();

router.post(ENDPOINTS.POST.COMPANY.LOGIN, async (req, res) => {
    const { name, passId } = req.body

    try {
        const DATA = await company.login(name, passId)
        res.status(200).json({
            data: DATA,
            status: true
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
});

module.exports = router ;