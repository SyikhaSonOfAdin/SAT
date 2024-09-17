const SAT = require("../../.conf/db-conf");
const TABLES = require("../../.conf/tables");

class Summary {

    getSummary = async (date) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = `
          -- Untuk Departemen Utama
SELECT 
    cd.ID AS ID, 
    cd.NAME AS DEPARTMENTS, 
    NULL AS SUB_DEPARTMENT_ID, 
    NULL AS SUB_NAME, 
    COALESCE(SUM(CASE WHEN ci.DATE = ? AND ci.SHIFT = 0 THEN 1 ELSE 0 END), 0) AS PRESENT, 
    COALESCE(SUM(CASE WHEN lw.ID IS NOT NULL AND ci.WORKER_ID IS NULL AND co.WORKER_ID IS NULL THEN 1 ELSE 0 END), 0) AS ABSENT, 
    COALESCE(SUM(CASE WHEN (ci.DATE = ? AND ci.SHIFT = 1) OR (co.DATE = ? AND co.SHIFT = 1) THEN 1 ELSE 0 END), 0) AS NIGHT_SHIFT, 
    COUNT(lw.ID) AS TOTAL 
FROM 
    company_departments AS cd 
LEFT JOIN 
    list_worker AS lw ON lw.DEPARTMENT_ID = cd.ID AND lw.SUB_DEPARTMENT_ID IS NULL
LEFT JOIN 
    worker_checkin AS ci ON lw.ID = ci.WORKER_ID AND ci.DATE = ? 
LEFT JOIN 
    worker_checkout AS co ON lw.ID = co.WORKER_ID AND co.DATE = ? 
GROUP BY 
    cd.ID, cd.NAME 

UNION ALL

-- Untuk Sub-Departemen
SELECT 
    cd.ID AS ID, 
    cd.NAME AS DEPARTMENTS, 
    sd.ID AS SUB_DEPARTMENT_ID, 
    sd.NAME AS SUB_NAME, 
    COALESCE(SUM(CASE WHEN ci.DATE = ? AND ci.SHIFT = 0 THEN 1 ELSE 0 END), 0) AS PRESENT, 
    COALESCE(SUM(CASE WHEN lw.ID IS NOT NULL AND ci.WORKER_ID IS NULL AND co.WORKER_ID IS NULL THEN 1 ELSE 0 END), 0) AS ABSENT, 
    COALESCE(SUM(CASE WHEN (ci.DATE = ? AND ci.SHIFT = 1) OR (co.DATE = ? AND co.SHIFT = 1) THEN 1 ELSE 0 END), 0) AS NIGHT_SHIFT, 
    COUNT(lw.ID) AS TOTAL 
FROM 
    company_departments AS cd 
JOIN 
    list_sub_department AS sd ON cd.ID = sd.DEPARTMENT_ID 
LEFT JOIN 
    list_worker AS lw ON lw.SUB_DEPARTMENT_ID = sd.ID 
LEFT JOIN 
    worker_checkin AS ci ON lw.ID = ci.WORKER_ID AND ci.DATE = ? 
LEFT JOIN 
    worker_checkout AS co ON lw.ID = co.WORKER_ID AND co.DATE = ? 
GROUP BY 
    cd.ID, cd.NAME, sd.ID, sd.NAME 
ORDER BY 
    DEPARTMENTS, SUB_NAME;
        `;

        const PARAMS = [date, date, date, date, date, date, date, date, date, date];

        try {
            const DATA = await CONNECTION.query(QUERY, PARAMS);
            return DATA;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    };

    downloadData = async (projectId, dateStart, dateEnd) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = `WITH RECURSIVE date_range AS (
    SELECT ? AS DATE
    UNION ALL
    SELECT DATE + INTERVAL 1 DAY
    FROM date_range
    WHERE DATE < ?
)
SELECT 
    lw.ID, 
    DATE_FORMAT(dr.DATE, '%Y-%m-%d') AS DATE, 
    lw.NAME AS WORKER, 
    cd.NAME AS DEPARTMENT,
    COALESCE(wi_checkin.TIME, '-') AS CHECKIN, 
    COALESCE(wi_checkout.TIME, '-') AS CHECKOUT 
FROM 
    date_range AS dr
CROSS JOIN 
    list_worker AS lw
JOIN company_departments AS cd ON lw.DEPARTMENT_ID = cd.ID   
LEFT JOIN 
    worker_checkin AS wi_checkin ON lw.ID = wi_checkin.WORKER_ID AND wi_checkin.DATE = dr.DATE
LEFT JOIN  worker_checkout AS wi_checkout ON lw.ID = wi_checkout.WORKER_ID AND wi_checkout.DATE = dr.DATE WHERE lw.PROJECT_ID = ? ORDER BY lw.NAME, dr.DATE;

                    `
        const PARAMS = [[dateStart, dateEnd, projectId]]

        try {
            const [data] = await CONNECTION.query(QUERY, PARAMS[0])
            return data
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

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

    getByDateandSubDepartment = async (date, sub_departments_id) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = `
            SELECT LW.${TABLES.LIST_WORKER.COLUMN.NAME}, COALESCE(DATE_FORMAT(CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE}, '%Y-%m-%d'), DATE_FORMAT(CO.${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, '%Y-%m-%d')) AS DATE,
                   COALESCE(CO.${TABLES.WORKER_CHECKOUT.COLUMN.SHIFT}, CI.${TABLES.WORKER_CHECKIN.COLUMN.SHIFT}) AS SHIFT, 
                   CI.${TABLES.WORKER_CHECKIN.COLUMN.TIME} AS CHECKIN, 
                   CO.${TABLES.WORKER_CHECKOUT.COLUMN.TIME} AS CHECKOUT 
            FROM ${TABLES.LIST_WORKER.TABLE} AS LW 
            JOIN ${TABLES.LIST_SUB_DEPARTMENT.TABLE} AS CD 
                ON LW.${TABLES.LIST_WORKER.COLUMN.SUB_DEPARTMENT_ID} = CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} 
            LEFT JOIN ${TABLES.WORKER_CHECKIN.TABLE} AS CI 
                ON LW.${TABLES.LIST_WORKER.COLUMN.ID} = CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} 
                AND CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE} = ? 
            LEFT JOIN ${TABLES.WORKER_CHECKOUT.TABLE} AS CO 
                ON LW.${TABLES.LIST_WORKER.COLUMN.ID} = CO.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} 
                AND CO.${TABLES.WORKER_CHECKOUT.COLUMN.DATE} = ? 
            WHERE CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = ?
        `;

        const PARAMS = [date, date, sub_departments_id];

        try {
            const DATA = await CONNECTION.query(QUERY, PARAMS);
            return DATA;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }

    getByDepartmentId = async (search, based_on, shift, department_id, startDate, endDate) => {
        const CONNECTION = await SAT.getConnection()
        let QUERY = [
            `WITH RECURSIVE DateRange AS ( SELECT ? AS DATE  UNION ALL  SELECT DATE_ADD(DATE, INTERVAL 1 DAY)  FROM DateRange  WHERE DATE < ?) 
            SELECT lw.ID AS WORKER_ID, lw.NAME AS NAME, COALESCE(ci.TIME, '-') AS CHECKIN, COALESCE(co.TIME, '-') AS CHECKOUT, dr.DATE AS DATE  FROM list_worker AS lw 
            JOIN company_departments AS cd  ON lw.DEPARTMENT_ID = cd.ID  
            JOIN DateRange AS dr 
            LEFT JOIN worker_checkin AS ci  ON lw.ID = ci.WORKER_ID AND ci.DATE = dr.DATE 
            LEFT JOIN worker_checkout AS co  ON lw.ID = co.WORKER_ID AND co.DATE = dr.DATE 
            WHERE cd.ID = ?`
        ]
        const PARAMS = [startDate, endDate, department_id]

        if (shift !== "All Shift") {
            if (shift == "Day Shift") {
                QUERY[0] += ` AND lw.${TABLES.LIST_WORKER.COLUMN.SHIFT} = 0`;
            } else if (shift == "Night Shift") {
                QUERY[0] += ` AND lw.${TABLES.LIST_WORKER.COLUMN.SHIFT} = 1`;
            }
        }

        if (search !== "") {
            if (based_on == "Name") {
                QUERY[0] += ` AND lw.${TABLES.LIST_WORKER.COLUMN.NAME} LIKE ?`;
                PARAMS.push(`%${search}%`);
            } else if (based_on == "Worker Id") {
                QUERY[0] += ` AND lw.${TABLES.LIST_WORKER.COLUMN.ID} LIKE ?`;
                PARAMS.push(`%${search}%`);
            }
        }

        QUERY[0] += ` ORDER BY lw.ID, dr.DATE;`

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS)
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