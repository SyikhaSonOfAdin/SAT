const SAT = require("../../.conf/db-conf");
const TABLES = require("../../.conf/tables");

class SubDepartment {
    add = async (departmentId, userId, name) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = [
            `INSERT INTO ${TABLES.LIST_SUB_DEPARTMENT.TABLE} (${TABLES.LIST_SUB_DEPARTMENT.COLUMN.DEPARTMENT_ID}, ${TABLES.LIST_SUB_DEPARTMENT.COLUMN.INPUT_BY}, ${TABLES.LIST_SUB_DEPARTMENT.COLUMN.NAME})
            VALUES (?,?,?)`
        ]
        const PARAMS = [[departmentId, userId, name]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    delete = async (subDepartmentId) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = [
            `DELETE FROM ${TABLES.LIST_SUB_DEPARTMENT.TABLE} WHERE ${TABLES.LIST_SUB_DEPARTMENT.COLUMN.ID} = ?`
        ]
        const PARAMS = [[subDepartmentId]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0])
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }
}

module.exports = SubDepartment;