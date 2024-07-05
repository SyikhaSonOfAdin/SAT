const ENDPOINTS = require("../../../.conf/endpoints");
const Security = require("../../../middleware/security");
const Project = require("../../../modules/project/project");
const express = require('express');
const router = express.Router();

const project = new Project();
const security = new Security()


router.post(ENDPOINTS.POST.PROJECT.ADD, security.checkPassId, async (req, res) => {
    const { name, user_id } = req.body

    try {
        await project.add(req.params.company_id, name, user_id)
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