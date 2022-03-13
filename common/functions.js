module.exports = {
    checkRole: function (access) {
        return function (req, res, next) {
            if (req.user.role_access != undefined && req.user.role_access.indexOf(access) > -1) {
                next();
            } else {
                res.render('error/unauthorized', {
                    layout:'error'
                });
            }
        }
    }
};
