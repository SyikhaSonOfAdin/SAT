const SAT = require("../../.conf/db-conf");
const TABLES = require("../../.conf/tables");
const { COMPANY_DEPARTMENTS, LIST_WORKER, WORKER_CHECKIN } = require("../../.conf/tables");

class Summary {

    getSummary = async (date) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = `
            SELECT d.ID, d.NAME AS DEPARTMENTS, COALESCE(h.Presen, 0) AS PRESENT, COALESCE(a.Absent, 0) - COALESCE(n.Night_Shift, 0) AS ABSENT, t.Total AS TOTAL, COALESCE(n.Night_Shift, 0) AS NIGHT_SHIFT 
            FROM (SELECT lw.DEPARTMENT_ID, COUNT(lw.ID) AS Total FROM ${LIST_WORKER.TABLE} lw GROUP BY lw.DEPARTMENT_ID) t 
            LEFT JOIN (SELECT lw.DEPARTMENT_ID, COUNT(wc.ID) AS Presen FROM ${LIST_WORKER.TABLE} lw 
            LEFT JOIN ${WORKER_CHECKIN.TABLE} wc ON lw.ID = wc.WORKER_ID WHERE wc.DATE = ? 
            GROUP BY lw.DEPARTMENT_ID) h ON t.DEPARTMENT_ID = h.DEPARTMENT_ID 
            LEFT JOIN (SELECT lw.DEPARTMENT_ID, COUNT(lw.ID) - COUNT(wc.ID) AS Absent FROM ${LIST_WORKER.TABLE} lw 
            LEFT JOIN ${WORKER_CHECKIN.TABLE} wc ON lw.ID = wc.WORKER_ID AND wc.DATE = ? 
            GROUP BY lw.DEPARTMENT_ID) a ON t.DEPARTMENT_ID = a.DEPARTMENT_ID 
            LEFT JOIN (SELECT lw.DEPARTMENT_ID, COUNT(wc.ID) AS Night_Shift FROM ${LIST_WORKER.TABLE} lw 
            LEFT JOIN ${TABLES.WORKER_CHECKOUT.TABLE} wc ON lw.ID = wc.WORKER_ID WHERE wc.DATE = ? AND wc.SHIFT = 1 
            GROUP BY lw.DEPARTMENT_ID) n ON t.DEPARTMENT_ID = n.DEPARTMENT_ID LEFT JOIN ${COMPANY_DEPARTMENTS.TABLE} d  ON t.DEPARTMENT_ID = d.ID  ORDER BY DEPARTMENTS;
        `;

        const PARAMS = [date, date, date];

        try {
            const DATA = await CONNECTION.query(QUERY, PARAMS);
            return DATA;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    };


    getByDateandDepartment = async (date, departments_id) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = `
            SELECT LW.${TABLES.LIST_WORKER.COLUMN.NAME}, COALESCE(DATE_FORMAT(CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE}, '%Y-%m-%d'), DATE_FORMAT(CO.${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, '%Y-%m-%d')) AS DATE,
                   CO.${TABLES.WORKER_CHECKOUT.COLUMN.SHIFT}, 
                   CI.${TABLES.WORKER_CHECKIN.COLUMN.TIME} AS CHECKIN, 
                   CO.${TABLES.WORKER_CHECKOUT.COLUMN.TIME} AS CHECKOUT 
            FROM ${TABLES.LIST_WORKER.TABLE} AS LW 
            JOIN ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD 
                ON LW.${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} 
            LEFT JOIN ${TABLES.WORKER_CHECKIN.TABLE} AS CI 
                ON LW.${TABLES.LIST_WORKER.COLUMN.ID} = CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} 
                AND CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE} = ? 
            LEFT JOIN ${TABLES.WORKER_CHECKOUT.TABLE} AS CO 
                ON LW.${TABLES.LIST_WORKER.COLUMN.ID} = CO.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} 
                AND CO.${TABLES.WORKER_CHECKOUT.COLUMN.DATE} = ? 
            WHERE CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = ?
        `;

        const PARAMS = [date, date, departments_id]; // Parameter yang dibutuhkan dalam query

        try {
            const DATA = await CONNECTION.query(QUERY, PARAMS);
            return DATA;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }

}

module.exports = Summary