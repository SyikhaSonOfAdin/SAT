const Security = require('../../../middleware/security');
const ENDPOINTS = require('../../../.conf/endpoints');
const Storage = require('../../../.conf/multer-conf');
const Excel = require('../../../modules/excel/excel');
const express = require('express');
const CheckOut = require('../../../modules/attendance/checkOut');

const security = new Security()
const router = express.Router()
const storage = new Storage()
const excel = new Excel()
const checkout = new CheckOut()

router.post(ENDPOINTS.POST.CHECKOUT.UPLOAD, storage.excel.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            status: 'failed',
            message: 'File not uploaded',
        });
    }

    try {
        const RAW = await excel.getData(`${storage.nameFile}`);
        const DATA = excel.attendenceData(RAW);
        await checkout.uploadData(DATA)       
        await checkout.cleanUp()
        
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
});

module.exports = router ;
