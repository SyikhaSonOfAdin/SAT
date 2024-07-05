const ENDPOINTS = require("../../../.conf/endpoints");
const Security = require("../../../middleware/security");
const Company = require("../../../modules/company/company");
const express = require('express');
const router = express.Router();

const company = new Company();

router.post(ENDPOINTS.POST.COMPANY.ADD, async (req, res) => {
    const { name, password } = req.body

    try {
        await company.add(name, password)
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error
        })
    }
});

module.exports = router ;