const SubDepartment = require("../../../modules/departments/subDepartment");
const ENDPOINTS = require("../../../.conf/endpoints");
const express = require('express');
const security = require("../../../middleware/security");
const router = express.Router();

const subDepartment = new SubDepartment();


router.post(ENDPOINTS.POST.SUB_DEPARTMENTS.ADD,  async (req, res) => {
    const { department_id, uId, name } = req.body

    try {
        const decrypted_uId = await security.decrypt(uId)
        await subDepartment.add(department_id, decrypted_uId, name)
        res.status(200).json({
            status: 'success',
        })
    } catch (error) {        
        console.log(error.message)
        res.status(200).json({
            status: 'failed',
            info: error.message
        })
    }
});

module.exports = router ;