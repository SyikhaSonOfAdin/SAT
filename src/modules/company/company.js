const SAT = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")
const Security = require("../../middleware/security")

class Company {
    #security = new Security()

    add = async (name, password) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [`INSERT INTO ${TABLES.COMPANY.TABLE} (${TABLES.COMPANY.COLUMN.NAME}, 
            ${TABLES.COMPANY.COLUMN.PASSWORD}, ${TABLES.COMPANY.COLUMN.PASS_ID}) VALUES (?, ?, ?)`]

        const PASS_ID = this.#security.getID()
        const PARAMS = [[name, password, PASS_ID]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0]);
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }
}

module.exports = Company