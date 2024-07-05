const SAT = require("../../.conf/db-conf")
const SNC = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")

class Project {

    add = async (company_id, name, user_id) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [`INSERT INTO ${TABLES.COMPANY_PROJECTS.TABLE} (${TABLES.COMPANY_PROJECTS.COLUMN.COMPANY_ID}, 
            ${TABLES.COMPANY_PROJECTS.COLUMN.NAME}, ${TABLES.COMPANY_PROJECTS.COLUMN.INPUT_BY}) VALUES (?, ?, ?)`]
        const PARAMS = [[company_id, name, user_id]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0]);
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }
}

module.exports = Project