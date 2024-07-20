const SAT = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")

class Departments {

    add = async (company_id, user_id, name) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `INSERT INTO ${TABLES.COMPANY_DEPARTMENTS.TABLE} (${TABLES.COMPANY_DEPARTMENTS.COLUMN.COMPANY_ID}, ${TABLES.COMPANY_DEPARTMENTS.COLUMN.INPUT_BY}, ${TABLES.COMPANY_DEPARTMENTS.COLUMN.NAME})
            VALUES (?, ?, ?)`
        ]
        const PARAMS = [[company_id, user_id, name]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    get = async (company_id) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = [
            `SELECT CD.*, U.${TABLES.USER.COLUMN.USERNAME} AS INPUT_BY, COUNT(LW.${TABLES.LIST_WORKER.COLUMN.ID}) AS MEMBER 
             FROM ${TABLES.COMPANY_DEPARTMENTS.TABLE} AS CD 
             JOIN ${TABLES.USER.TABLE} AS U ON CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.INPUT_BY} = U.${TABLES.USER.COLUMN.ID}
             LEFT JOIN ${TABLES.LIST_WORKER.TABLE} AS LW ON CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = LW.${TABLES.LIST_WORKER.COLUMN.DEPARTMENT_ID}
             WHERE CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.COMPANY_ID} = ? 
             GROUP BY CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} 
             ORDER BY CD.${TABLES.COMPANY_DEPARTMENTS.COLUMN.NAME}`,
            `SELECT sub.*, COUNT(lw.ID) AS MEMBER 
            FROM list_sub_department AS sub 
            LEFT JOIN list_worker AS lw ON sub.ID = lw.SUB_DEPARTMENT_ID 
            JOIN company_departments AS CD ON sub.DEPARTMENT_ID = CD.ID
            WHERE sub.DEPARTMENT_ID = ?
            GROUP BY sub.ID;`,
            
        ];
        const PARAMS = [[company_id]];

        try {
            const [data] = await CONNECTION.query(QUERY[0], PARAMS[0]);
            if (data.length && data.length > 0) {
                const results = await Promise.all(data.map(async (item) => {
                    const subDepartments = await CONNECTION.query(QUERY[1], [item.ID]);
                    return {
                        ...item,
                        SUB_DEPARTMENTS: subDepartments[0]
                    };
                }));
                return results;
            }
            return data;
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    };


    edit = async (department_id) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `UPDATE ${TABLES.COMPANY_DEPARTMENTS.TABLE} SET ${TABLES.COMPANY_DEPARTMENTS.COLUMN.NAME} = ? WHERE ${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = ?`
        ]
        const PARAMS = [[department_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    delete = async (department_id) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `DELETE FROM ${TABLES.COMPANY_DEPARTMENTS.TABLE} WHERE ${TABLES.COMPANY_DEPARTMENTS.COLUMN.ID} = ?`
        ]
        const PARAMS = [[department_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    uploadData = async (company_id, user_id, array_of_data) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [
            `INSERT IGNORE INTO ${TABLES.COMPANY_DEPARTMENTS.TABLE} 
            (${TABLES.COMPANY_DEPARTMENTS.COLUMN.COMPANY_ID}, ${TABLES.COMPANY_DEPARTMENTS.COLUMN.INPUT_BY}, ${TABLES.COMPANY_DEPARTMENTS.COLUMN.NAME}) 
            VALUES (?, ?, ?)`
        ]

        try {
            for (let i = 0; i < array_of_data.length; i++) {
                const PARAMS = [company_id, user_id, array_of_data[i]["DEPARTEMEN"]]
                await CONNECTION.query(QUERY[0], PARAMS)
            }

        } catch (error) {
            throw error
        } finally {
            CONNECTION.release();
        }
    }
}

module.exports = Departments