const ENDPOINTS = {
    GET: {
        CHECKIN: '/checkin/:user_id/:project_id',
        CHECKOUT: '/checkout/:user_id/:project_id',
        SUMMARY: {
            BYDATE: '/summary/bydate/:user_id/:project_id',
            BYDATE_DEPARTMENT: '/summary/bydatedepartment/:user_id/:project_id',
        },
        DEPARTMENTS: {
            BYCOMPANYID: '/departments/:company_id'
        },
        WORKER: {
            BYPROJECTID: '/workers/:project_id/:company_id'
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
        CHECKIN: {
            UPLOAD: '/checkin/upload',
        },
        CHECKOUT: {
            UPLOAD: '/checkout/upload',
        },
        WORKER: {
            UPLOAD: '/worker/upload',
            DELETE: '/worker/delete',
            EDIT: '/worker/edit',
            ADD: '/worker/add',
        },
        DEPARTMENTS: {
            UPLOAD: '/departments/upload',
            ADD: '/departments/add',
            DELETE: '/departments/delete',
        },
        JOINTS: {
            WORKER_DEPARTMENTS: '/joint/upload/worker-departments'
        }
    }
}

module.exports = ENDPOINTS ;