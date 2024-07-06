const SAT = require("../../.conf/db-conf");
const { COMPANY_DEPARTMENTS, LIST_WORKER, WORKER_CHECKIN } = require("../../.conf/tables");

class Summary {

    getSummary = async (date) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = [
            `SELECT  d.ID, d.NAME AS DEPARTMENTS, COALESCE(h.Presen, 0) AS PRESENT, COALESCE(a.Absent, 0) AS ABSENT, t.Total AS TOTAL FROM 
            ( SELECT  lw.DEPARTMENT_ID,  COUNT(lw.ID) AS Total FROM  ${LIST_WORKER.TABLE} lw GROUP BY  lw.DEPARTMENT_ID ) t LEFT JOIN 
            ( SELECT  lw.DEPARTMENT_ID,  COUNT(wc.ID) AS Presen FROM  ${LIST_WORKER.TABLE} lw LEFT JOIN  ${WORKER_CHECKIN.TABLE} wc ON lw.ID = wc.WORKER_ID WHERE  wc.DATE = ? GROUP BY lw.DEPARTMENT_ID) h ON t.DEPARTMENT_ID = h.DEPARTMENT_ID LEFT JOIN 
            ( SELECT  lw.DEPARTMENT_ID,  COUNT(lw.ID) - COUNT(wc.ID) AS Absent FROM ${LIST_WORKER.TABLE} lw LEFT JOIN ${WORKER_CHECKIN.TABLE} wc ON lw.ID = wc.WORKER_ID AND wc.DATE = ? GROUP BY lw.DEPARTMENT_ID
            ) a ON t.DEPARTMENT_ID = a.DEPARTMENT_ID LEFT JOIN ${COMPANY_DEPARTMENTS.TABLE} d ON t.DEPARTMENT_ID = d.ID ORDER BY DEPARTMENTS;
            `
        ]
        const PARAMS = [[date, date]]

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS[0])
            return DATA
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }

    }

    getByDateandDepartment = async (date, departments_id) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = [
            `SELECT LW.NAME, DATE_FORMAT(CI.DATE, '%Y-%m-%d') AS DATE, LW.${LIST_WORKER.COLUMN.SHIFT}, CI.TIME FROM ${LIST_WORKER.TABLE} AS LW 
            JOIN ${COMPANY_DEPARTMENTS.TABLE} AS CD ON LW.DEPARTMENT_ID = CD.ID 
            LEFT JOIN ${WORKER_CHECKIN.TABLE} AS CI ON LW.ID = CI.WORKER_ID AND CI.DATE = ? WHERE CD.ID = ?`
        ]
        const PARAMS = [[date, departments_id]]

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS[0])
            return DATA
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }
}

module.exports = Summary