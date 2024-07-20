const ENDPOINTS = require("../../../.conf/endpoints");
const Departments = require("../../../modules/departments/departments");
const Project = require("../../../modules/project/project");
const express = require('express');
const Worker = require("../../../modules/worker/worker");
const security = require("../../../middleware/security");
const router = express.Router();

const worker = new Worker();


router.post(ENDPOINTS.POST.WORKER.ADD,  async (req, res) => {
    const { id, name, department_id, project_id, input_by } = req.body

    try {
        const decrypted_projectId = await security.decrypt(project_id)
        const decrypted_inputBy = await security.decrypt(input_by)

        await worker.add(id, name, department_id, decrypted_projectId, decrypted_inputBy)
        
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