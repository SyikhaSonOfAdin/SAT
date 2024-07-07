const SAT = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")

class Worker {

    add = async (name, department_id, project_id, input_by) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY_SELECT_LAST_ID = `SELECT MAX(${TABLES.LIST_WORKER.COLUMN.ID}) AS lastId FROM ${TABLES.LIST_WORKER.TABLE}`
        const QUERY_INSERT = `INSERT INTO ${TABLES.LIST_WORKER.TABLE} (${TABLES.LIST_WORKER.COLUMN.ID}, ${TABLES.LIST_WORKER.COLUMN.NAME}, ${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID}, ${TABLES.LIST_WORKER.COLUMN.PROJECT_ID}, ${TABLES.LIST_WORKER.COLUMN.INPUT_BY}) VALUES (?, ?, ?, ?, ?)`

        try {
            const [rows] = await CONNECTION.query(QUERY_SELECT_LAST_ID)
            const lastId = rows[0].lastId || 0
            const newId = lastId + 1

            await CONNECTION.query(QUERY_INSERT, [newId, name, department_id, project_id, input_by])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    delete = async (worker_id) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `DELETE FROM ${TABLES.LIST_WORKER.TABLE} WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ?`
        ]
        const PARAMS = [[worker_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    edit = async (name, department_id, worker_id, shift) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `UPDATE ${TABLES.LIST_WORKER.TABLE} SET ${TABLES.LIST_WORKER.COLUMN.NAME} =  ?, ${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = ?, ${TABLES.LIST_WORKER.COLUMN.SHIFT} = ? 
            WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ?`
        ]
        const PARAMS = [[name, department_id, shift, worker_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    getByProjectId = async (project_id, search, department_id, page, per_page) => {
        const CONNECTION = await SAT.getConnection();
        const LIMIT = parseInt(per_page);
        const OFFSET = page * LIMIT;

        let QUERY = `
            SELECT LW.*, DATE_FORMAT(LW.${TABLES.LIST_WORKER.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, LW.${TABLES.LIST_WORKER.COLUMN.NAME}, CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.NAME} AS DEPARTMENT
            FROM ${TABLES.LIST_WORKER.TABLE} AS LW 
            LEFT JOIN ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD ON LW.${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID}
            WHERE LW.${TABLES.LIST_WORKER.COLUMN.PROJECT_ID} = ? 
        `;

        const PARAMS = [project_id];

        if (department_id !== "") {
            QUERY += ` AND LW.${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = ?`;
            PARAMS.push(department_id);
        }

        if (search !== "") {
            QUERY += ` AND LW.${TABLES.LIST_WORKER.COLUMN.NAME} LIKE ?`;
            PARAMS.push(`%${search}%`);
        }

        QUERY += ` ORDER BY LW.${TABLES.LIST_WORKER.COLUMN.NAME} LIMIT ? OFFSET ?`;
        PARAMS.push(LIMIT, OFFSET);

        try {
            const DATA = await CONNECTION.query(QUERY, PARAMS);
            return DATA;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    };


    uploadData = async (project_id, user_id, array_of_data) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `INSERT IGNORE INTO ${TABLES.LIST_WORKER.TABLE} 
            (${TABLES.LIST_WORKER.COLUMN.ID}, ${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID}, ${TABLES.LIST_WORKER.COLUMN.PROJECT_ID}, ${TABLES.LIST_WORKER.COLUMN.INPUT_BY}, ${TABLES.LIST_WORKER.COLUMN.NAME}) 
            VALUES (?, (SELECT CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} FROM ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD WHERE CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.NAME} = ? ), ?, ?, ?)`
        ]

        try {
            for (let i = 0; i < array_of_data.length; i++) {
                const PARAMS = [array_of_data[i]["ID"], array_of_data[i]["DEPARTEMEN"], project_id, user_id, array_of_data[i]["NAMA"]]
                await CONNECTION.query(QUERY[0], PARAMS)
            }

        } catch (error) {
            throw error
        } finally {
            CONNECTION.release();
        }
    }
}

module.exports = Worker