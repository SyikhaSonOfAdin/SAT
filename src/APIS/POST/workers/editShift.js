const ENDPOINTS = require("../../../.conf/endpoints");
const Departments = require("../../../modules/departments/departments");
const Project = require("../../../modules/project/project");
const express = require('express');
const Worker = require("../../../modules/worker/worker");
const router = express.Router();

const worker = new Worker();


router.post(ENDPOINTS.POST.WORKER.EDIT_SHIFT,  async (req, res) => {
    const { worker_id, shift } = req.body

    try {
        await worker.editShift(worker_id, shift)
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