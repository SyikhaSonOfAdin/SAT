const SAT = require("../../.conf/db-conf");
const TABLES = require("../../.conf/tables");

class Summary {

    getSummary = async (date) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = `
            SELECT cd.ID, cd.NAME AS DEPARTMENTS,        
        COALESCE(SUM(CASE WHEN ci.DATE = ? AND ci.SHIFT = 0 THEN 1 ELSE 0 END), 0) AS PRESENT    , 
        COALESCE(SUM(CASE WHEN ci.DATE IS NULL AND co.DATE IS NULL THEN 1 ELSE 0 END), 0) AS ABSENT,
        COALESCE(SUM(CASE WHEN (ci.DATE = ? AND ci.SHIFT = 1) OR (co.DATE = ? AND co.SHIFT = 1) THEN 1 ELSE 0 END), 0) AS NIGHT_SHIFT,
        COUNT(lw.ID) AS TOTAL       
        FROM list_worker AS lw 
        JOIN company_departments AS cd ON lw.DEPARTMENT_ID = cd.ID 
        LEFT JOIN worker_checkin AS ci ON lw.ID = ci.WORKER_ID AND ci.DATE = ?
        LEFT JOIN worker_checkout AS co ON lw.ID = co.WORKER_ID AND co.DATE = ?
        GROUP BY cd.ID, cd.NAME ORDER BY cd.NAME;
        `;

        const PARAMS = [date, date, date, date, date];

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
                   COALESCE(CO.${TABLES.WORKER_CHECKOUT.COLUMN.SHIFT}, CI.${TABLES.WORKER_CHECKIN.COLUMN.SHIFT}) AS SHIFT, 
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

        const PARAMS = [date, date, departments_id]; 

        try {
            const DATA = await CONNECTION.query(QUERY, PARAMS);
            return DATA;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }

    getByDepartmentId = async (department_id, startDate, endDate) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `WITH RECURSIVE DateRange AS ( SELECT ? AS DATE UNION ALL SELECT DATE_ADD(DATE, INTERVAL 1 DAY) FROM DateRange WHERE DATE < ?)
            SELECT lw.ID AS WORKER_ID, lw.NAME AS NAME, COALESCE(ci.TIME, '-') AS TIME, dr.DATE AS DATE FROM list_worker AS lw 
            JOIN company_departments AS cd ON lw.DEPARTMENT_ID = cd.ID 
            JOIN DateRange AS dr
            LEFT JOIN worker_checkin AS ci ON lw.ID = ci.WORKER_ID AND ci.DATE = dr.DATE 
            WHERE cd.ID = ?
            ORDER BY lw.ID, dr.DATE;`
        ]
        const PARAMS = [[startDate, endDate,department_id]]

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS[0])
            return DATA
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    getNumberDepartments = async (company_id) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `SELECT COUNT(CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID}) AS NUMBER_OF_DEPARTMENTS FROM ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD WHERE CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.COMPANY_ID} = ?`
        ]
        const PARAMS = [[company_id]]

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS[0])
            return DATA
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    getNumberWorkers = async (project_id) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `SELECT COUNT(LW.${TABLES.LIST_WORKER.COLUMN.ID}) AS NUMBER_OF_WORKERS FROM ${TABLES.LIST_WORKER.TABLE} AS LW WHERE LW.${TABLES.LIST_WORKER.COLUMN.PROJECT_ID} = ?`
        ]
        const PARAMS = [[project_id]]

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS[0])
            return DATA
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    getUnregisteredWorkers = async () => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `SELECT DISTINCT wc.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} FROM ${TABLES.WORKER_CHECKIN.TABLE} AS wc 
            LEFT JOIN ${TABLES.LIST_WORKER.TABLE} AS lw ON wc.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} = lw.${TABLES.LIST_WORKER.COLUMN.ID} 
            WHERE lw.${TABLES.LIST_WORKER.COLUMN.ID} IS NULL
            ORDER BY wc.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID};`
        ]
        // const PARAMS = [[project_id]]

        try {
            const DATA = await CONNECTION.query(QUERY[0])
            return DATA
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    getNumberUnregisteredWorkers = async () => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `SELECT COUNT(DISTINCT wc.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID}) AS UNREGISTERED_WORKERS FROM ${TABLES.WORKER_CHECKIN.TABLE} AS wc 
            LEFT JOIN ${TABLES.LIST_WORKER.TABLE} AS lw ON wc.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} = lw.${TABLES.LIST_WORKER.COLUMN.ID} 
            WHERE lw.${TABLES.LIST_WORKER.COLUMN.ID} IS NULL
            ORDER BY wc.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID};`
        ]
        // const PARAMS = [[project_id]]

        try {
            const DATA = await CONNECTION.query(QUERY[0])
            return DATA
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

}

module.exports = Summary