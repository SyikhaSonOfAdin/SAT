const PATH_CONF = {
    POST: {
        COMPANY: {
            ADD: require('../APIS/POST/company/add')
        },
        PROJECT: {
            ADD: require('../APIS/POST/project/add')
        },
        USERS: {
            LOGIN: require('../APIS/POST/users/login'),
            ADD: require('../APIS/POST/users/add'),
        },        
        CHECKIN: {
            UPLOAD: require('../APIS/POST/uploadData/checkIn')
        },
        CHECKOUT: {
            UPLOAD: require('../APIS/POST/uploadData/checkOut')
        },
        WORKER: {
            ADD: require('../APIS/POST/workers/add'),
            EDIT: require('../APIS/POST/workers/edit'),
            DELETE: require('../APIS/POST/workers/delete'),
        },
        JOINTS: {
            WORKER_DEPARTMENTS: require('../APIS/POST/uploadData/workerAndDepartments')
        },
        DEPARTMENTS: {
            ADD: require('../APIS/POST/departments/addDepartments'),
            DELETE: require('../APIS/POST/departments/delete'),
        }
    },
    GET: {
        CHECKIN: {
            BYDATE: require('../APIS/GET/checkIn/checkIn')
        },
        CHECKOUT: {
            BYDATE: require('../APIS/GET/checkout/checkOut')
        },
        SUMMARY: {
            BYDATE: require('../APIS/GET/summary/getByDate'),
            BYDATEDEPARTMENT: require('../APIS/GET/summary/getByDateandDepartment'),
            BYDEPARTMENT: require('../APIS/GET/summary/getByDepartment'),
        },
        DEPARTMENTS: {
            BYCOMPANYID: require('../APIS/GET/departments/byCompanyId')
        },
        WORKERS: {
            BYPROJECTID: require('../APIS/GET/workers/getByProjectId'),
            GETID: require('../APIS/GET/workers/getId'),
        }
    }
}

const ARRAY_PATH = {
    POST: [
        PATH_CONF.POST.COMPANY.ADD,
        PATH_CONF.POST.PROJECT.ADD,

        PATH_CONF.POST.USERS.LOGIN,
        PATH_CONF.POST.USERS.ADD,

        PATH_CONF.POST.CHECKIN.UPLOAD,
        PATH_CONF.POST.CHECKOUT.UPLOAD,

        PATH_CONF.POST.WORKER.DELETE,
        PATH_CONF.POST.WORKER.EDIT,
        PATH_CONF.POST.WORKER.ADD,
        
        PATH_CONF.POST.JOINTS.WORKER_DEPARTMENTS,

        PATH_CONF.POST.DEPARTMENTS.ADD,
        PATH_CONF.POST.DEPARTMENTS.DELETE,
    ],
    GET: [
        PATH_CONF.GET.CHECKIN.BYDATE,
        PATH_CONF.GET.CHECKOUT.BYDATE,

        PATH_CONF.GET.SUMMARY.BYDATE,
        PATH_CONF.GET.SUMMARY.BYDATEDEPARTMENT,
        PATH_CONF.GET.SUMMARY.BYDEPARTMENT,

        PATH_CONF.GET.DEPARTMENTS.BYCOMPANYID,

        PATH_CONF.GET.WORKERS.BYPROJECTID,
        PATH_CONF.GET.WORKERS.GETID,
    ]
}
module.exports = ARRAY_PATH;