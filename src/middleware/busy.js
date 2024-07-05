class Busy {

    constructor() {
        this.isBusy = false;
    }

    checkIfBusy(req, res, next) {
        if (this.isBusy) {
            return res.status(200).json({
                status: 'failed',
                code: res.statusCode,
                message: "Server is busy!"
            });
        }
        next();
    }
}

module.exports = Busy ;