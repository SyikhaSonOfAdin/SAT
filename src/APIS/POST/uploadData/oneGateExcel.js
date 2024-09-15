const CheckOut = require('../../../modules/attendance/checkOut');
const CheckIn = require('../../../modules/attendance/checkIn');
const ENDPOINTS = require('../../../.conf/endpoints');
const Storage = require('../../../.conf/multer-conf');
const Excel = require('../../../modules/excel/excel');
const SAT = require('../../../.conf/db-conf');
const express = require('express');

const router = express.Router();
const storage = new Storage();
const excel = new Excel();
const checkIn = new CheckIn();
const checkOut = new CheckOut();

let isProcessing = false;  // Flag untuk mengecek apakah proses sedang berjalan

router.post(ENDPOINTS.POST.ONE_GATE.UPLOAD.EXCEL, storage.excel.single('file'), async (req, res) => {
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

    console.time('Request Execution Time');

    try {
        CONNECTION = await SAT.getConnection();
        await CONNECTION.beginTransaction();
        
        const RAW = await excel.getData(`${storage.nameFile}`);
        const DATA = excel.attendenceData(RAW);
        const time = "15:00:00";
        const [hours, minutes, seconds] = time.split(":").map(Number);
        const targetSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;

        const batchInsertData = [];
        
        console.time('Execution Time get shift');
        for (let i = 0; i < DATA.length; i++) {
            const { WORKER_ID, DATE, TIME } = DATA[i];
            const [h, m, s] = TIME.split(":").map(Number);
            const recordSeconds = (h * 60 * 60) + (m * 60) + s;
            
            const isNightShift = await checkOut.isNightShiftWC(CONNECTION, WORKER_ID);
            
            // Simpan data ke batch
            batchInsertData.push({
                worker_id: WORKER_ID,
                date: DATE,
                time: TIME,
                is_night_shift: isNightShift,
                record_seconds: recordSeconds,
                target_seconds: targetSeconds,
            });
        }
        console.timeEnd('Execution Time get shift');        
        
        // Mengelompokkan data berdasarkan worker_id dan date
        const groupedData = batchInsertData.reduce((acc, data) => {
            const key = `${data.worker_id}-${data.date}`;
            if (!acc[key]) {
                acc[key] = { checkIn: null, checkOut: null };
            }
            
            // Memilih check-in paling awal dan check-out paling akhir
            if (data.record_seconds < data.target_seconds) {
                if (data.is_night_shift) {
                    if (!acc[key].checkOut || data.record_seconds > acc[key].checkOut.record_seconds) {
                        acc[key].checkOut = data;
                    }
                } else {
                    if (!acc[key].checkIn || data.record_seconds < acc[key].checkIn.record_seconds) {
                        acc[key].checkIn = data;
                    }
                }
            } else {
                if (data.is_night_shift) {
                    if (!acc[key].checkIn || data.record_seconds < acc[key].checkIn.record_seconds) {
                        acc[key].checkIn = data;
                    }
                } else {
                    if (!acc[key].checkOut || data.record_seconds > acc[key].checkOut.record_seconds) {
                        acc[key].checkOut = data;
                    }
                }
            }
            
            return acc;
        }, {});
        
        const insertCheckIn = [];
        const insertCheckOut = [];
        
        Object.values(groupedData).forEach(({ checkIn, checkOut }) => {
            if (checkIn) {
                insertCheckIn.push([checkIn.worker_id, checkIn.date, checkIn.time, checkIn.is_night_shift]);
            }
            if (checkOut) {
                insertCheckOut.push([checkOut.worker_id, checkOut.date, checkOut.time, checkOut.is_night_shift]);
            }
        });
        
        console.time('Execution insert data');
        // Bulk insert untuk check-in dan check-out
        if (insertCheckIn.length > 0) {
            await checkIn.bulkAddWC(CONNECTION, insertCheckIn);
        }
        if (insertCheckOut.length > 0) {
            await checkOut.bulkAddWC(CONNECTION, insertCheckOut);
        }
        console.timeEnd('Execution insert data');

        // console.time('Execution Cleanup data');
        // await Promise.all([checkIn.cleanUp(CONNECTION), checkOut.cleanUp(CONNECTION)]);
        // console.timeEnd('Execution Cleanup data');
        
        // Commit transaksi
        await CONNECTION.commit();

        res.status(200).json({
            status: 'upload success',
        });

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
        console.timeEnd('Request Execution Time');
    }
});

module.exports = router;
