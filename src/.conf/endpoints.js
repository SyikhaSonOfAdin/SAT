const ENDPOINTS = {
    GET: {
        CHECKIN: '/checkin/:user_id/:project_id',
        CHECKOUT: '/checkout/:user_id/:project_id',
        SUMMARY: {
            BYDATE: '/summary/bydate/:user_id/:project_id',
            BYDATE_DEPARTMENT: '/summary/bydatedepartment/:user_id/:project_id',
            BYDATE_SUB_DEPARTMENT: '/summary/bydatesubdepartment/:user_id/:project_id',
            DEPARTMENT: '/summary/department/:department_id/:company_id',
            NUMBER_OF: '/summary/dashboard/numbers/:company_id/:project_id',            
        },
        DEPARTMENTS: {
            BYCOMPANYID: '/departments/:company_id',
        },
        WORKER: {
            BYPROJECTID: '/workers/:project_id/:company_id',
            GETID: '/workers/getid/:project_id/:company_id',
            UNREGISTERED_WORKERS: '/workers/getunregisteredworkers/:project_id/:company_id',
        }
    },
    POST: {
        COMPANY: {
            ADD: '/company/add',   
            EDIT: '/company/edit/:company_id/:pass_id',
            DELETE: '/company/delete/:company_id/:pass_id',
        },
        PROJECT: {
            ADD: '/project/add/:company_id/:pass_id',
            EDIT: '/project/edit/:company_id/:pass_id',
            DELETE: '/project/delete/:company_id/:pass_id',
        },
        USERS: {
            LOGIN: '/users/login',
            ADD: '/users/add/:company_id/:pass_id',
            EDIT: '/users/edit/:company_id/:pass_id',
            DELETE: '/users/delete/:company_id/:pass_id',
        },                     
        ONE_GATE: {
            UPLOAD: {
                DAT: '/upload/file/dat',
                EXCEL: '/upload/file/excel',
            }
        },
        WORKER: {
            UPLOAD: '/worker/upload',
            DELETE: '/worker/delete',
            EDIT: '/worker/edit',
            EDIT_SHIFT: '/worker/edit/shift',
            ADD: '/worker/add',
        },
        DEPARTMENTS: {
            UPLOAD: '/departments/upload',
            ADD: '/departments/add',
            DELETE: '/departments/delete',
        },
        SUB_DEPARTMENTS: {
            ADD: '/sub_departments/add',
            DELETE: '/sub_departments/delete',
        },
        JOINTS: {
            WORKER_DEPARTMENTS: '/joint/upload/worker-departments'
        }
    }
}

module.exports = ENDPOINTS ;