const ENDPOINTS = require("../../../.conf/endpoints");
const security = require("../../../middleware/security");
const Departments = require("../../../modules/departments/departments");
const Project = require("../../../modules/project/project");
const express = require('express');
const router = express.Router();

const departments = new Departments();


router.post(ENDPOINTS.POST.DEPARTMENTS.ADD,  async (req, res) => {
    const { company_id, user_id, name } = req.body

    try {
        const decrypted_companyId = await security.decrypt(company_id)
        const decrypted_userId = await security.decrypt(user_id)

        await departments.add(decrypted_companyId, decrypted_userId, name)
        
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