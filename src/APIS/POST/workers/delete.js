const ENDPOINTS = require("../../../.conf/endpoints");
const Departments = require("../../../modules/departments/departments");
const Project = require("../../../modules/project/project");
const express = require('express');
const Worker = require("../../../modules/worker/worker");
const router = express.Router();

const worker = new Worker();


router.post(ENDPOINTS.POST.WORKER.DELETE,  async (req, res) => {
    const { worker_id, includeData } = req.body

    try {
        await worker.delete(worker_id, includeData)
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