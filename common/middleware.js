//class for common function
module.exports = {
    flashMiddelware: async function (req, res, next) {
        let error = req.flash('error');
        let success = req.flash('success');
        if (success.length > 0) {
            res.locals.flash = {
                type: 'success',
                message: success
            };
        }
        if (error.length > 0) {
            res.locals.flash = {
                type: 'error',
                message: error
            };
        }
        return next();
    },
    commonMiddelware: async function (req, res, next) {
        if (req.user) {
            res.locals.userSession = req.user;
            res.locals.base_url = process.env.BASE_URL;
            res.locals.socket_base_url = process.env.SOCKET_BASE_URL;
        }
        return next();
    },
    paginationSort: async function (req, res, next) {
        let skip = 0;
        let limit = 50;
        let sort = {};
        let page = 1;
        if (req.query.p && req.query.p > 0) {
            skip = ((limit * req.query.p) - limit);
            page = req.query.p
        }
        if (req.query.sf != undefined && req.query.s != undefined) {
            sort[req.query.sf] = (req.query.s == "desc" ? -1 : 1);
            sort['_id'] = -1;
        } else {
            sort = { _id: -1 };
        }
        req.pageSort = {sort, limit, skip, page};
        return next();
    }
};