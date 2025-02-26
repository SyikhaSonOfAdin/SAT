const SAT = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")

class CheckIn {
    cleanUp = async () => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `DELETE FROM ${TABLES.WORKER_CHECKIN.TABLE} WHERE ${TABLES.WORKER_CHECKIN.COLUMN.ID} IN 
            ( SELECT wc1.${TABLES.WORKER_CHECKIN.COLUMN.ID} FROM ${TABLES.WORKER_CHECKIN.TABLE} AS wc1 JOIN ${TABLES.WORKER_CHECKIN.TABLE} AS wc2 ON wc1.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} = wc2.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} 
             AND wc1.${TABLES.WORKER_CHECKIN.COLUMN.DATE} = wc2.${TABLES.WORKER_CHECKIN.COLUMN.DATE} AND wc1.${TABLES.WORKER_CHECKIN.COLUMN.TIME} > wc2.${TABLES.WORKER_CHECKIN.COLUMN.TIME});`
        ]
        try {
            await CONNECTION.query(QUERY[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    getByDate = async (project_id, date, page, per_page) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `SELECT CI.${TABLES.WORKER_CHECKIN.COLUMN.ID}, CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID}, CI.${TABLES.WORKER_CHECKIN.COLUMN.TIME}, DATE_FORMAT(CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE}, '%Y-%m-%d') AS DATE, LW.${TABLES.LIST_WORKER.COLUMN.NAME} FROM ${TABLES.WORKER_CHECKIN.TABLE} AS CI 
            JOIN ${TABLES.LIST_WORKER.TABLE} AS LW ON CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} = LW.${TABLES.LIST_WORKER.COLUMN.ID}
            WHERE LW.${TABLES.LIST_WORKER.COLUMN.PROJECT_ID} = ? AND CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE} = ? LIMIT ? OFFSET ?`
        ]
        const LIMIT = parseInt(per_page)
        const OFFSET = page * LIMIT
        const PARAMS = [[project_id, date, LIMIT, OFFSET]]

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS[0]);
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
            `SELECT LW.${TABLES.LIST_WORKER.COLUMN.NAME}, DATE_FORMAT(CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE}, '%Y-%d-%m') AS DATE, CI.${TABLES.WORKER_CHECKIN.COLUMN.TIME} FROM ${TABLES.LIST_WORKER.TABLE} AS LW 
            JOIN ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD ON LW.${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} 
            JOIN ${TABLES.WORKER_CHECKIN.TABLE} AS CI ON LW.${TABLES.LIST_WORKER.COLUMN.ID} = CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} AND CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE} = ? WHERE CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = ?`
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

    getByName = async (project_id, search, page, per_page) => {
        const CONNECTION = await SAT.getConnection();
        const LIMIT = parseInt(per_page);
        const OFFSET = page * LIMIT;
        
        let QUERY;
        let PARAMS;

        if (search === "") {
            QUERY = [
                `SELECT CI.${TABLES.WORKER_CHECKIN.COLUMN.ID}, CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID}, CI.${TABLES.WORKER_CHECKIN.COLUMN.TIME}, DATE_FORMAT(CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE}, '%Y-%m-%d') AS DATE, LW.${TABLES.LIST_WORKER.COLUMN.NAME} 
                FROM ${TABLES.WORKER_CHECKIN.TABLE} AS CI 
                JOIN ${TABLES.LIST_WORKER.TABLE} AS LW ON CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} = LW.${TABLES.LIST_WORKER.COLUMN.ID}
                WHERE LW.${TABLES.LIST_WORKER.COLUMN.PROJECT_ID} = ? LIMIT ? OFFSET ?`
            ];
            PARAMS = [project_id, LIMIT, OFFSET];
        } else {
            QUERY = [
                `SELECT CI.${TABLES.WORKER_CHECKIN.COLUMN.ID}, CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID}, CI.${TABLES.WORKER_CHECKIN.COLUMN.TIME}, DATE_FORMAT(CI.${TABLES.WORKER_CHECKIN.COLUMN.DATE}, '%Y-%m-%d') AS DATE, LW.${TABLES.LIST_WORKER.COLUMN.NAME} 
                FROM ${TABLES.WORKER_CHECKIN.TABLE} AS CI 
                JOIN ${TABLES.LIST_WORKER.TABLE} AS LW ON CI.${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID} = LW.${TABLES.LIST_WORKER.COLUMN.ID}
                WHERE LW.${TABLES.LIST_WORKER.COLUMN.PROJECT_ID} = ? AND LW.${TABLES.LIST_WORKER.COLUMN.NAME} LIKE ? LIMIT ? OFFSET ?`
            ];
            PARAMS = [project_id, `%${search}%`, LIMIT, OFFSET];
        }

        try {
            const DATA = await CONNECTION.query(QUERY[0], PARAMS);
            return DATA;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    };


    uploadData = async (array_of_data) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `INSERT INTO ${TABLES.WORKER_CHECKIN.TABLE} (${TABLES.WORKER_CHECKIN.COLUMN.WORKER_ID}, ${TABLES.WORKER_CHECKIN.COLUMN.DATE}, ${TABLES.WORKER_CHECKIN.COLUMN.TIME}) VALUES (?, ?, ?)`
        ]

        try {
            for (let i = 0; i < array_of_data.length; i++) {
                const PARAMS = [array_of_data[i]["WORKER_ID"], array_of_data[i]["DATE"], array_of_data[i]["TIME"]]
                await CONNECTION.query(QUERY[0], PARAMS)
            }

        } catch (error) {
            throw error
        } finally {
            CONNECTION.release();
        }
    }


}

module.exports = CheckIn