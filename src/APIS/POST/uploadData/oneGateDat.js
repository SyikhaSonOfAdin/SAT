const CheckOut = require('../../../modules/attendance/checkOut');
const CheckIn = require('../../../modules/attendance/checkIn');
const ENDPOINTS = require('../../../.conf/endpoints');
const Storage = require('../../../.conf/multer-conf');
const Dat = require('../../../modules/dat/dat');
const SAT = require('../../../.conf/db-conf');
const express = require('express');

const router = express.Router();
const storage = new Storage();
const dat = new Dat()
const checkIn = new CheckIn();
const checkOut = new CheckOut();

let isProcessing = false;  // Flag untuk mengecek apakah proses sedang berjalan

router.post(ENDPOINTS.POST.ONE_GATE.UPLOAD.DAT, storage.dat.single('file'), async (req, res) => {
    if (isProcessing) {
        return res.status(503).json({
            status: 'failed',
            message: 'Server is processing another request. Please try again later.',
        });
    }

    if (!req.file) {
        return res.status(400).json({
            status: 'failed',
            message: 'File not uploaded',
        });
    }

    isProcessing = true;
    let CONNECTION

    try {
        res.status(200).json({
            status: 'upload success, processing',
        });

        const DATA = await dat.getData(storage.nameFile)
        const time = "15:00:00";
        const [hours, minutes, seconds] = time.split(":").map(Number);
        const targetSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;

        CONNECTION = await SAT.getConnection();
        await CONNECTION.beginTransaction();

        for (let i = 0; i < DATA.length; i++) {
            const [h, m, s] = DATA[i]["TIME"].split(":").map(Number);
            const recordSeconds = (h * 60 * 60) + (m * 60) + s;

            if (recordSeconds < targetSeconds) {
                if (await checkOut.isNightShiftWC(CONNECTION, DATA[i]["WORKER_ID"])) {
                    await checkOut.addWC(CONNECTION, DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"]);
                } else {
                    await checkIn.addWC(CONNECTION, DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"]);
                }
            } else {
                if (await checkOut.isNightShiftWC(CONNECTION, DATA[i]["WORKER_ID"])) {
                    await checkIn.addWC(CONNECTION, DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"]);
                } else {
                    await checkOut.addWC(CONNECTION, DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"]);
                }
            }
        }

        await checkIn.cleanUp(CONNECTION);
        await checkOut.cleanUp(CONNECTION);
        await CONNECTION.commit();

    } catch (error) {
        await CONNECTION.rollback();
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred while processing the file.',
            info: error.message,
        });
    } finally {
        CONNECTION.release()
        isProcessing = false;
    }
});

module.exports = router;
