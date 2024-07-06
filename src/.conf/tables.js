const TABLES = {
    USER: {
        TABLE: "users",
        COLUMN: {
            ID: "ID",
            COMPANY_ID: "COMPANY_ID",
            PROJECT_ID: "PROJECT_ID",
            USERNAME: "USERNAME",
            EMAIL: "EMAIL",
            PASSWORD: "PASSWORD",
            LEVEL: "LEVEL",
            SINCE: "SINCE",
        }
    },
    COMPANY: {
        TABLE: "company",
        COLUMN: {
            ID: "ID",
            PASSWORD: "PASSWORD",
            NAME: "NAME",
            SINCE: "SINCE",
            PASS_ID: "PASS_ID",
        }
    },
    COMPANY_DEPARTMENTS: {
        TABLE: "company_departments",
        COLUMN: {
            ID: "ID",
            COMPANY_ID: "COMPANY_ID",
            INPUT_BY: "INPUT_BY",
            NAME: "NAME",
        }
    },
    COMPANY_PROJECTS: {
        TABLE: "company_projects",
        COLUMN: {
            ID: "ID",
            COMPANY_ID: "COMPANY_ID",
            NAME: "NAME",
            INPUT_BY: "INPUT_BY",
            INPUT_DATE: "INPUT_DATE",
        }
    },
    LIST_WORKER: {
        TABLE: "list_worker",
        COLUMN: {
            ID: "ID",
            DEPARTMENT_ID: "DEPARTMENT_ID",
            PROJECT_ID: "PROJECT_ID",
            INPUT_BY: "INPUT_BY",
            INPUT_DATE: "INPUT_DATE",
            NAME: "NAME",
            SHIFT: "SHIFT",
        }
    },
    WORKER_CHECKIN: {
        TABLE: "worker_checkin",
        COLUMN: {
            ID: "ID",
            WORKER_ID: "WORKER_ID",
            DATE: "DATE",
            TIME: "TIME",
        }
    },
    WORKER_CHECKOUT: {
        TABLE: "worker_checkout",
        COLUMN: {
            ID: "ID",
            WORKER_ID: "WORKER_ID",
            DATE: "DATE",
            TIME: "TIME",
        }
    }
};

module.exports = TABLES;
