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
    const { id, name, department_id, project_id, input_by } = req.body

    try {
        await worker.add(id, name, department_id, project_id, input_by)
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