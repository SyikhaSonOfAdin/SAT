const crypto = require('crypto');
const SNC = require('../.conf/db-conf');
const TABLES = require('../.conf/tables');

class Security {
    getID = () => {
        return crypto.randomBytes(16).toString('hex');
    }

    checkPassId = async (req, res, next) => {
        if (!req.params.company_id || !req.params.pass_id) {
            res.status(403).json({
                message: "Access denied",
                information: "Invalid parameters"
            })
        }

        const company_id = req.params.company_id
        const pass_id = req.params.pass_id
        const CONNECTION = await SNC.getConnection()
        const QUERY = [`SELECT * FROM ${TABLES.COMPANY.TABLE} WHERE ${TABLES.COMPANY.COLUMN.ID} = ? AND ${TABLES.COMPANY.COLUMN.PASS_ID} = ?`]
        const PARAMS = [[company_id, pass_id]]

        try {
            const isThere = await CONNECTION.query(QUERY[0], PARAMS[0])

            if (isThere[0].length > 0) {
                next()
            } else {
                res.status(403).json({
                    message: "Access denied",
                    information: "Not authorized"
                })
            }
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }

    checkUser = async (req, res, next) => {
        if (!req.params.company_id || !req.params.pass_id) {
            res.status(403).json({
                message: "Access denied",
                information: "Invalid parameters"
            })
        }

        const company_id = req.params.company_id
        const pass_id = req.params.pass_id
        const CONNECTION = await SNC.getConnection()
        const QUERY = [`SELECT * FROM ${TABLES.COMPANY.TABLE} WHERE ${TABLES.COMPANY.COLUMN.ID} = ? AND ${TABLES.COMPANY.COLUMN.PASS_ID} = ?`]
        const PARAMS = [[company_id, pass_id]]

        try {
            const isThere = await CONNECTION.query(QUERY[0], PARAMS[0])

            if (isThere[0].length > 0) {
                next()
            } else {
                res.status(403).json({
                    message: "Access denied",
                    information: "Not authorized"
                })
            }
        } catch (error) {
            throw error
        } finally {
            CONNECTION.release()
        }
    }
}

module.exports = Security