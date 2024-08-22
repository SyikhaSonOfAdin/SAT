const CheckOut = require('../../../modules/attendance/checkOut');
const CheckIn = require('../../../modules/attendance/checkIn');
const ENDPOINTS = require('../../../.conf/endpoints');
const Storage = require('../../../.conf/multer-conf');
const Dat = require('../../../modules/dat/dat');
const SAT = require('../../../.conf/db-conf');
const express = require('express');

const router = express.Router();
const storage = new Storage();
const dat = new Dat();
const checkIn = new CheckIn();
const checkOut = new CheckOut();

let isProcessing = false; // Flag untuk mengecek apakah proses sedang berjalan

// Ubah ke multiple files upload
router.post(ENDPOINTS.POST.ONE_GATE.UPLOAD.DAT, storage.dat.array('files'), async (req, res) => {
    if (isProcessing) {
        return res.status(503).json({
            status: 'failed',
            message: 'Server is processing another request. Please try again later.',
        });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            status: 'failed',
            message: 'No files uploaded',
        });
    }

    isProcessing = true;
    let CONNECTION;

    console.time('Execution Time Dat Bulk'); // Start timing the execution

    try {
        
        CONNECTION = await SAT.getConnection();
        await CONNECTION.beginTransaction();
        
        const time = "15:00:00";
        const [hours, minutes, seconds] = time.split(":").map(Number);
        const targetSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;
        
        const batchInsertData = [];
        
        for (const file of req.files) {
            const DATA = await dat.getData(file.filename);
            
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
        }
        
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

        console.time('Execution Cleanup data');
        await Promise.all([checkIn.cleanUp(CONNECTION), checkOut.cleanUp(CONNECTION)]);
        console.timeEnd('Execution Cleanup data');
        
        // Commit transaksi
        await CONNECTION.commit();

        res.status(200).json({
            status: 'upload success, processing',
        });

    } catch (error) {
        if (CONNECTION) {
            await CONNECTION.rollback();
        }
        console.log(error.message);
        res.status(500).json({
            message: error.message
        });
    } finally {
        if (CONNECTION) {
            CONNECTION.release();
        }
        isProcessing = false;

        console.timeEnd('Execution Time Dat Bulk'); // End timing the execution and log the result
    }
});

module.exports = router;
