const SAT = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")

class CheckOut {
    add = async (worker_id, date, time) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `INSERT INTO ${TABLES.WORKER_CHECKOUT.TABLE} (${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID}, ${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, ${TABLES.WORKER_CHECKOUT.COLUMN.TIME}, ${TABLES.WORKER_CHECKOUT.COLUMN.SHIFT}) 
            VALUES (?, ?, ?, COALESCE((SELECT CI.${TABLES.LIST_WORKER.COLUMN.SHIFT} FROM ${TABLES.LIST_WORKER.TABLE} AS CI WHERE CI.${TABLES.LIST_WORKER.COLUMN.ID} = ?), 0 ))`
        ]
        const PARAMS = [[worker_id, date, time, worker_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release();
        }
    }

    addWC = async (CONNECTION, worker_id, date, time) => {
        const QUERY = [
            `INSERT INTO ${TABLES.WORKER_CHECKOUT.TABLE} (${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID}, ${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, ${TABLES.WORKER_CHECKOUT.COLUMN.TIME}, ${TABLES.WORKER_CHECKOUT.COLUMN.SHIFT}) 
            VALUES (?, ?, ?, COALESCE((SELECT CI.${TABLES.LIST_WORKER.COLUMN.SHIFT} FROM ${TABLES.LIST_WORKER.TABLE} AS CI WHERE CI.${TABLES.LIST_WORKER.COLUMN.ID} = ?), 0 ))`
        ]
        const PARAMS = [[worker_id, date, time, worker_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        }
    }


    cleanUp = async (CONNECTION) => {
        const QUERY = [
            `DELETE FROM ${TABLES.WORKER_CHECKOUT.TABLE} WHERE ${TABLES.WORKER_CHECKOUT.COLUMN.ID} IN 
            ( SELECT wc1.${TABLES.WORKER_CHECKOUT.COLUMN.ID} FROM ${TABLES.WORKER_CHECKOUT.TABLE} AS wc1 JOIN ${TABLES.WORKER_CHECKOUT.TABLE} AS wc2 ON wc1.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} = wc2.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} 
             AND wc1.${TABLES.WORKER_CHECKOUT.COLUMN.DATE} = wc2.${TABLES.WORKER_CHECKOUT.COLUMN.DATE} AND wc1.${TABLES.WORKER_CHECKOUT.COLUMN.TIME} < wc2.${TABLES.WORKER_CHECKOUT.COLUMN.TIME});`,
            `DELETE t1 FROM ${TABLES.WORKER_CHECKOUT.TABLE} t1 JOIN ${TABLES.WORKER_CHECKOUT.TABLE} t2 ON t1.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} = t2.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} 
            AND t1.${TABLES.WORKER_CHECKOUT.COLUMN.DATE} = t2.${TABLES.WORKER_CHECKOUT.COLUMN.DATE} AND t1.${TABLES.WORKER_CHECKOUT.COLUMN.TIME} = t2.${TABLES.WORKER_CHECKOUT.COLUMN.TIME} 
            AND t1.${TABLES.WORKER_CHECKOUT.COLUMN.ID} > t2.${TABLES.WORKER_CHECKOUT.COLUMN.ID};`
        ]
        try {
            for (let i = 0; i < QUERY.length; i++) {
                await CONNECTION.query(QUERY[i])
            }
        } catch (error) {
            throw error
        }
    }

    getByDate = async (project_id, date, page, per_page) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `SELECT CI.${TABLES.WORKER_CHECKOUT.COLUMN.ID}, CI.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID}, CI.${TABLES.WORKER_CHECKOUT.COLUMN.TIME}, DATE_FORMAT(CI.${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, '%Y-%m-%d') AS DATE, LW.${TABLES.LIST_WORKER.COLUMN.NAME} FROM ${TABLES.WORKER_CHECKOUT.TABLE} AS CI 
            JOIN ${TABLES.LIST_WORKER.TABLE} AS LW ON CI.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} = LW.${TABLES.LIST_WORKER.COLUMN.ID}
            WHERE LW.${TABLES.LIST_WORKER.COLUMN.PROJECT_ID} = ? AND CI.${TABLES.WORKER_CHECKOUT.COLUMN.DATE} = ? LIMIT ? OFFSET ?`
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

    getByName = async (project_id, search, page, per_page) => {
        const CONNECTION = await SAT.getConnection();
        const LIMIT = parseInt(per_page);
        const OFFSET = page * LIMIT;

        let QUERY;
        let PARAMS;

        if (search === "") {
            QUERY = [
                `SELECT CI.${TABLES.WORKER_CHECKOUT.COLUMN.ID}, CI.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID}, CI.${TABLES.WORKER_CHECKOUT.COLUMN.TIME}, DATE_FORMAT(CI.${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, '%Y-%m-%d') AS DATE, LW.${TABLES.LIST_WORKER.COLUMN.NAME} 
                FROM ${TABLES.WORKER_CHECKOUT.TABLE} AS CI 
                JOIN ${TABLES.LIST_WORKER.TABLE} AS LW ON CI.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} = LW.${TABLES.LIST_WORKER.COLUMN.ID}
                WHERE LW.${TABLES.LIST_WORKER.COLUMN.PROJECT_ID} = ? LIMIT ? OFFSET ?`
            ];
            PARAMS = [project_id, LIMIT, OFFSET];
        } else {
            QUERY = [
                `SELECT CI.${TABLES.WORKER_CHECKOUT.COLUMN.ID}, CI.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID}, CI.${TABLES.WORKER_CHECKOUT.COLUMN.TIME}, DATE_FORMAT(CI.${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, '%Y-%m-%d') AS DATE, LW.${TABLES.LIST_WORKER.COLUMN.NAME} 
                FROM ${TABLES.WORKER_CHECKOUT.TABLE} AS CI 
                JOIN ${TABLES.LIST_WORKER.TABLE} AS LW ON CI.${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID} = LW.${TABLES.LIST_WORKER.COLUMN.ID}
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

    isNightShift = async (worker_id) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = `SELECT SHIFT FROM ${TABLES.LIST_WORKER.TABLE} WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ?`;
        const PARAMS = [worker_id];

        try {
            const [rows] = await CONNECTION.query(QUERY, PARAMS);
            if (rows.length > 0) {
                return rows[0].SHIFT == 1;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    };

    isNightShiftWC = async (CONNECTION, worker_id) => {
        const QUERY = `SELECT SHIFT FROM ${TABLES.LIST_WORKER.TABLE} WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ?`;
        const PARAMS = [worker_id];

        try {
            const [rows] = await CONNECTION.query(QUERY, PARAMS);
            if (rows.length > 0) {
                return rows[0].SHIFT == 1;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    };


    uploadData = async (array_of_data) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `INSERT INTO ${TABLES.WORKER_CHECKOUT.TABLE} (${TABLES.WORKER_CHECKOUT.COLUMN.WORKER_ID}, ${TABLES.WORKER_CHECKOUT.COLUMN.DATE}, ${TABLES.WORKER_CHECKOUT.COLUMN.TIME}) 
            VALUES (?, ?, ?, COALESCE((SELECT CI.${TABLES.LIST_WORKER.COLUMN.SHIFT} FROM ${TABLES.LIST_WORKER.TABLE} AS CI WHERE CI.${TABLES.LIST_WORKER.COLUMN.ID} = ?), 0 ))`
        ]

        try {
            for (let i = 0; i < array_of_data.length; i++) {
                const PARAMS = [array_of_data[i]["WORKER_ID"], array_of_data[i]["DATE"], array_of_data[i]["TIME"], array_of_data[i]["WORKER_ID"]]
                await CONNECTION.query(QUERY[0], PARAMS)
            }

        } catch (error) {
            throw error
        } finally {
            CONNECTION.release();
        }
    }
}

module.exports = CheckOut