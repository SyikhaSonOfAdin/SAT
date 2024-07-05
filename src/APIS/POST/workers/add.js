const ENDPOINTS = require("../../../.conf/endpoints");
const Security = require("../../../middleware/security");
const Departments = require("../../../modules/departments/departments");
const Project = require("../../../modules/project/project");
const express = require('express');
const Worker = require("../../../modules/worker/worker");
const router = express.Router();

const worker = new Worker();
const security = new Security()


router.post(ENDPOINTS.POST.WORKER.ADD,  async (req, res) => {
    const { name, department_id, project_id, input_by} = req.body

    try {
        await worker.add(name, department_id, project_id, input_by)
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {        
        console.log(error.message)
        res.status(200).json({
            status: 'failed',
            info: error
        })
    }
});

module.exports = router ;