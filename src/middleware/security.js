const crypto = require('crypto');
const SNC = require('../.conf/db-conf');
const TABLES = require('../.conf/tables');
const ENCRYPTION_KEY = require('../.conf/.app.conf');

class Security {
    #ENCRYPTION_KEY = ENCRYPTION_KEY
    #IV_LENGTH = 16;

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

    encrypt = (value) => {
        console.log(this.#ENCRYPTION_KEY)
        const iv = crypto.randomBytes(this.#IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.#ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(value);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt = async (value) => {
        try {
            const textParts = value.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.#ENCRYPTION_KEY), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            throw new Error("Invalid session. Please log in again.")
        }
    }
}
const security = new Security();
module.exports = security