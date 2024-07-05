const Security = require('../../../middleware/security');
const ENDPOINTS = require('../../../.conf/endpoints');
const Storage = require('../../../.conf/multer-conf');
const Excel = require('../../../modules/excel/excel');
const express = require('express');
const Departments = require('../../../modules/departments/departments');
const Worker = require('../../../modules/worker/worker');

const security = new Security()
const router = express.Router()
const storage = new Storage()
const excel = new Excel()
const departments = new Departments()
const worker = new Worker()

router.post(ENDPOINTS.POST.JOINTS.WORKER_DEPARTMENTS, storage.excel.single('file'), async (req, res) => {
    const {company_id, project_id, user_id} = req.body

    if (!req.file) {
        return res.status(400).json({
            status: 'failed',
            message: 'File not uploaded',
        });
    }

    try {
        const RAW = await excel.getData(`${storage.nameFile}`);
        await departments.uploadData(company_id, user_id, RAW)
        await worker.uploadData(project_id, user_id, RAW)

        
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
