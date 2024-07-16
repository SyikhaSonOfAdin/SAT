const Security = require('../../../middleware/security');
const ENDPOINTS = require('../../../.conf/endpoints');
const Storage = require('../../../.conf/multer-conf');
const express = require('express');
const CheckIn = require('../../../modules/attendance/checkIn');
const CheckOut = require('../../../modules/attendance/checkOut');
const Dat = require('../../../modules/dat/dat');

const security = new Security()
const router = express.Router()
const storage = new Storage()
const dat = new Dat()
const checkIn = new CheckIn()
const checkOut = new CheckOut()

router.post(ENDPOINTS.POST.ONE_GATE.UPLOAD, storage.dat.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            status: 'failed',
            message: 'File not uploaded',
        });
    }

    try {
        const DATA = await dat.getData(storage.nameFile)
        const time = "15:00:00"
        var array = time.split(":");
        var seconds = (parseInt(array[0], 10) * 60 * 60) + (parseInt(array[1], 10) * 60) + parseInt(array[2], 10)
        for (let i = 0; i < DATA.length; i++) {
            var array2 = DATA[i]["TIME"].split(":");
            var seconds2 = (parseInt(array2[0], 10) * 60 * 60) + (parseInt(array2[1], 10) * 60) + parseInt(array2[2], 10)
            if (seconds2 < seconds) {
                await checkOut.isNightShift(DATA[i]["WORKER_ID"]) ? await checkOut.add(DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"]) : await checkIn.add(DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"])
            } else {
                await checkOut.isNightShift(DATA[i]["WORKER_ID"]) ? await checkIn.add(DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"]) : await checkOut.add(DATA[i]["WORKER_ID"], DATA[i]["DATE"], DATA[i]["TIME"])
            }
        }
        await checkIn.cleanUp()
        await checkOut.cleanUp()

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

module.exports = router;
