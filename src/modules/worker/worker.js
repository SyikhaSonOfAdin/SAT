const SAT = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")

class Worker {

    add = async (id, name, department_id, department_type, project_id, input_by) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY_SELECT_LAST_ID = `SELECT MAX(${TABLES.LIST_WORKER.COLUMN.ID}) AS lastId FROM ${TABLES.LIST_WORKER.TABLE}`

        const QUERY_INSERT = `INSERT INTO ${TABLES.LIST_WORKER.TABLE} (${TABLES.LIST_WORKER.COLUMN.ID}, ${TABLES.LIST_WORKER.COLUMN.NAME}, 
        ${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID}, ${TABLES.LIST_WORKER.COLUMN.PROJECT_ID}, ${TABLES.LIST_WORKER.COLUMN.INPUT_BY}) VALUES (?, ?, ?, ?, ?)`

        const QUERY_INSERT_SUB = `INSERT INTO ${TABLES.LIST_WORKER.TABLE} (${TABLES.LIST_WORKER.COLUMN.ID}, ${TABLES.LIST_WORKER.COLUMN.NAME}, 
        ${TABLES.LIST_WORKER.COLUMN.SUB_DEPARTMENT_ID}, ${TABLES.LIST_WORKER.COLUMN.PROJECT_ID}, ${TABLES.LIST_WORKER.COLUMN.INPUT_BY}, ${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID}) 
        VALUES (?, ?, ?, ?, ?, (SELECT CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} FROM ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD 
        JOIN ${TABLES.LIST_SUB_DEPARTMENT.TABLE} AS LSD ON CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = LSD.${TABLES.LIST_SUB_DEPARTMENT.COLUMN.DEPARTMENT_ID} WHERE LSD.${TABLES.LIST_SUB_DEPARTMENT.COLUMN.ID} = ?))`

        try {
            if (department_type === "main") {
                if (id == "null" || id == "" || id == null) {
                    const [rows] = await CONNECTION.query(QUERY_SELECT_LAST_ID)
                    const lastId = rows[0].lastId || 0
                    const newId = lastId + 1

                    await CONNECTION.query(QUERY_INSERT, [newId, name, department_id, project_id, input_by])
                } else {
                    await CONNECTION.query(QUERY_INSERT, [id, name, department_id, project_id, input_by])
                }
            } else if (department_type === "sub") {
                if (id == "null" || id == "" || id == null) {
                    const [rows] = await CONNECTION.query(QUERY_SELECT_LAST_ID)
                    const lastId = rows[0].lastId || 0
                    const newId = lastId + 1

                    await CONNECTION.query(QUERY_INSERT_SUB, [newId, name, department_id, project_id, input_by, department_id])
                } else {
                    await CONNECTION.query(QUERY_INSERT_SUB, [id, name, department_id, project_id, input_by, department_id])
                }
            } else {
                throw new Error("Invalid department type")
            }
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

    edit = async (name, department_id, department_type, worker_id, shift) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `UPDATE ${TABLES.LIST_WORKER.TABLE} SET ${TABLES.LIST_WORKER.COLUMN.NAME} =  ?, ${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = ?, ${TABLES.LIST_WORKER.COLUMN.SHIFT} = ? , ${TABLES.LIST_WORKER.COLUMN.SUB_DEPARTMENT_ID} = NULL
            WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ?`,
            `UPDATE ${TABLES.LIST_WORKER.TABLE} SET ${TABLES.LIST_WORKER.COLUMN.NAME} =  ?, ${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = (SELECT CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} FROM ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD 
            JOIN ${TABLES.LIST_SUB_DEPARTMENT.TABLE} AS LSD ON CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = LSD.${TABLES.LIST_SUB_DEPARTMENT.COLUMN.DEPARTMENT_ID} WHERE LSD.${TABLES.LIST_SUB_DEPARTMENT.COLUMN.ID} = ?), 
            ${TABLES.LIST_WORKER.COLUMN.SUB_DEPARTMENT_ID} = ?, ${TABLES.LIST_WORKER.COLUMN.SHIFT} = ? WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ?`
        ]
        const PARAMS = [[name, department_id, shift, worker_id], [name, department_id, department_id, shift, worker_id]]

        try {
            if (department_type === "main") {
                await CONNECTION.query(QUERY[0], PARAMS[0])
            } else if (department_type === "sub") {
                await CONNECTION.query(QUERY[1], PARAMS[1])
            } else {
                throw new Error("Invalid department type")
            }
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    editShift = async (worker_id, shift) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `UPDATE ${TABLES.LIST_WORKER.TABLE} SET ${TABLES.LIST_WORKER.COLUMN.SHIFT} =  ?
            WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ?`
        ]
        const PARAMS = [[shift, worker_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    getId = async (id) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `SELECT EXISTS( SELECT 1 FROM ${TABLES.LIST_WORKER.TABLE} WHERE ${TABLES.LIST_WORKER.COLUMN.ID} = ? ) AS id_exists`
        ]
        const PARAMS = [[id]]

        try {
            const isExist = await CONNECTION.query(QUERY[0], PARAMS[0])
            return isExist[0][0]["id_exists"]
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
    SELECT LW.*, DATE_FORMAT(LW.${TABLES.LIST_WORKER.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, 
    LW.${TABLES.LIST_WORKER.COLUMN.NAME}, 
    CASE 
        WHEN LW.${TABLES.LIST_WORKER.COLUMN.SUB_DEPARTMENT_ID} IS NOT NULL THEN SD.${TABLES.LIST_SUB_DEPARTMENT.COLUMN.NAME}
        ELSE CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.NAME}
    END AS DEPARTMENT
    FROM ${TABLES.LIST_WORKER.TABLE} AS LW 
    LEFT JOIN ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD 
    ON LW.${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID} = CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID}
    LEFT JOIN ${TABLES.LIST_SUB_DEPARTMENT.TABLE} AS SD 
    ON LW.${TABLES.LIST_WORKER.COLUMN.SUB_DEPARTMENT_ID} = SD.${TABLES.LIST_SUB_DEPARTMENT.COLUMN.ID}
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