const express = require('express');
const ENDPOINTS = require('../../../.conf/endpoints');
const exceljs = require('exceljs');
const Summary = require('../../../modules/attendance/summary');
const security = require('../../../middleware/security');

const router = express.Router();

const summary = new Summary()

router.get(ENDPOINTS.GET.DOWNLOAD.BYDATE, async (req, res) => {
    const projectId = req.params.project_id
    const dateStart = req.query.dateStart
    const dateEnd = req.query.dateEnd
    const decryptedProjectId = security.decrypt(projectId)
    if (!decryptedProjectId || !dateStart || !dateEnd) return res.status(400).json({ message: "Invalid parameters" });

    try {
        const DATA = await summary.downloadData(decryptedProjectId, dateStart, dateEnd)
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        const headers = ['Date', 'Worker Name', 'Department', 'CheckIn', 'CheckOut'];

        worksheet.addRow(headers);

        DATA.forEach((items) => {
            worksheet.addRow([items.DATE, items.WORKER, items.DEPARTMENT, items.CHECKIN, items.CHECKOUT]);
        });


        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=WorkerAttendance.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router