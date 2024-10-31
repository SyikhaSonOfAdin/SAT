const SAT = require("../../.conf/db-conf")
const TABLES = require("../../.conf/tables")
const security = require("../../middleware/security")

class Company {

    add = async (name, password) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [`INSERT INTO ${TABLES.COMPANY.TABLE} (${TABLES.COMPANY.COLUMN.NAME}, 
            ${TABLES.COMPANY.COLUMN.PASSWORD}, ${TABLES.COMPANY.COLUMN.PASS_ID}, ${TABLES.COMPANY.COLUMN.SINCE}) VALUES (?, ?, ?, NOW())`]

        const PASS_ID = security.getID()
        const PARAMS = [[name, password, PASS_ID]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0]);
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }

    login = async (name, passId) => {
        const CONNECTION = await SAT.getConnection()
        const QUERY = [`SELECT C.* FROM ${TABLES.COMPANY.TABLE} AS C WHERE C.${TABLES.COMPANY.COLUMN.NAME} = ? AND C.${TABLES.COMPANY.COLUMN.PASS_ID} = ?`]
        const PARAMS = [[name, passId]]

        try {
            const [DATA] = await CONNECTION.query(QUERY[0], PARAMS[0]);
            if (DATA.length && DATA.length > 0) {
                const COMPANY = [{
                    ID: security.encrypt(DATA[0]["ID"].toString()),
                    PASSWORD: security.encrypt(DATA[0]["PASSWORD"]),
                    NAME: DATA[0]["NAME"],
                    PASS_ID: DATA[0]["PASS_ID"],
                }]
                return COMPANY
            } else {
                throw new Error("Incorrect Name or Password")
            }
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }
    
}

module.exports = Company