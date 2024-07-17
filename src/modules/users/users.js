const TABLES = require('../../.conf/tables');
const SAT = require('../../.conf/db-conf');
const security = require('../../middleware/security');

class Users {

    authentication = async (Email, Password) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = [
            `SELECT u.*, c.${TABLES.COMPANY.COLUMN.NAME} AS COMPANY_NAME, p.${TABLES.COMPANY_PROJECTS.COLUMN.NAME} AS PROJECT_NAME
            FROM ${TABLES.USER.TABLE} AS u JOIN ${TABLES.COMPANY.TABLE} AS c ON u.${TABLES.USER.COLUMN.COMPANY_ID} = c.${TABLES.COMPANY.COLUMN.ID}
            JOIN ${TABLES.COMPANY_PROJECTS.TABLE} AS p ON u.${TABLES.USER.COLUMN.PROJECT_ID} = p.${TABLES.COMPANY_PROJECTS.COLUMN.ID} 
            WHERE u.${TABLES.USER.COLUMN.EMAIL} = ? AND u.${TABLES.USER.COLUMN.PASSWORD} = ?`
        ] ;
        const PARAMS = [[Email, Password]] ;

        try {
            const isExist = await CONNECTION.query(QUERY[0], PARAMS[0]) ;
            
            if (isExist[0].length > 0) {
                return {
                    authentication: true,
                    id: security.encrypt(isExist[0][0]["ID"].toString()),
                    email: security.encrypt(isExist[0][0]["EMAIL"]),
                    password: security.encrypt(isExist[0][0]["PASSWORD"]),
                    username: isExist[0][0]["USERNAME"],
                    level: security.encrypt(isExist[0][0]["LEVEL"].toString()),
                    company_id: security.encrypt(isExist[0][0]["COMPANY_ID"].toString()),
                    company_name: isExist[0][0]["COMPANY_NAME"],
                    project_id: security.encrypt(isExist[0][0]["PROJECT_ID"].toString()),
                    project_name: isExist[0][0]["PROJECT_NAME"],
                }
            } else {
                return {
                    Authentication: false                   
                }
            }
        } catch (error) {
            throw error ;
        } finally {
            CONNECTION.release() ;
        }
    }

    add = async (company_id, project_id, username, email, password, level) => {
        const CONNECTION = await SAT.getConnection();
        const QUERY = [`INSERT INTO ${TABLES.USER.TABLE} (${TABLES.USER.COLUMN.COMPANY_ID}, ${TABLES.USER.COLUMN.PROJECT_ID}, ${TABLES.USER.COLUMN.USERNAME}, 
            ${TABLES.USER.COLUMN.EMAIL}, ${TABLES.USER.COLUMN.PASSWORD}, ${TABLES.USER.COLUMN.LEVEL}) VALUES (?, ?, ?, ?, ?, ?)`];

        const PARAMS = [[company_id, project_id, username, email, password, level]]

        try {
            await CONNECTION.query(QUERY[0], PARAMS[0]);
        } catch (error) {
            throw error;
        } finally {
            CONNECTION.release();
        }
    }
}

module.exports = Users