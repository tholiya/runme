var blockScript = {};
var blockCss = {};
var Handlebars = require('handlebars');
var helpers = require('handlebars-helpers')({
    handlebars: Handlebars
});
var queryString = require('query-string');
var moment = require('moment');

module.exports = {
    defaultLayout: 'default',
    extname: '.hbs',
    // Specify helpers which are only registered on this instance.
    helpers: Object.assign(helpers, {
        /**
         * helper function for debug view variables into server log
         * @param  {string}
         * @return {null|void}
         */
        debug: function (data) {
            console.log(data);
        },
        /**
         * retrieve script from_block script var and add into layout at given position
         * @param  {string}
         * @return {string}
         */
        getScript: function (position) {
            var str = "";
            if (typeof blockScript[position] != 'undefined') {
                for (i = 0; i < blockScript[position].length; i++) {
                    str += '<script src="' + blockScript[position][i] + '"></script>'
                }
                blockScript[position] = [];
            }
            return new Handlebars.SafeString(str);
        },
        /**
         * retrieve script from_block script var and add into layout at given position
         * @param  {string}
         * @return {string}
         */
        getCss: function (position) {
            var str = "";
            if (typeof blockCss[position] != 'undefined') {
                for (i = 0; i < blockCss[position].length; i++) {
                    str += '<link rel="stylesheet" href="' + blockCss[position][i] + '" />'
                }
                blockCss[position] = [];
            }
            return new Handlebars.SafeString(str);
        },
        /**
         * load javascript file into perticular position
         * @param  {string} position idetifier
         * @param  {string|array} set of sript path
         * @return {null}
         */
        setScript: function () {
            var args = [];
            for (i in arguments) {
                if (typeof arguments[i] == "string")
                    args.push(arguments[i]);
            };
            var position = args.shift();
            if (typeof blockScript[position] == 'undefined') {
                blockScript[position] = [];
            }
            blockScript[position] = blockScript[position].concat(args);
        },
        /**
         * load javascript file into perticular position
         * @param  {string} position idetifier
         * @param  {string|array} set of sript path
         * @return {null}
         */
        setCss: function () {
            var args = [];
            for (i in arguments) {
                if (typeof arguments[i] == "string")
                    args.push(arguments[i]);
            };
            var position = args.shift();
            if (typeof blockCss[position] == 'undefined') {
                blockCss[position] = [];
            }
            blockCss[position] = blockCss[position].concat(args);
        },
        flashMe: function (data) {
            let title = (data.type == 'error' ? 'Error' : (data.type == 'info' ? 'Info' : (data.type == 'success' ? 'Success' : (data.type == 'warning' ? 'Warning' : ''))));
            let str = "<script> toastr." + data.type + "('" + data.message + "', '" + title + "', { closeButton: true, tapToDismiss: false, progressBar: true, rtl: true});</script>";
            return new Handlebars.SafeString(str);
        },
        /**
         * This function is used for check passes role's access
         */
        checkAccess: function (access, options) {
            //check role in pre defined access configuration
            if (options.data.root.userSession.role_access != undefined && options.data.root.userSession.role_access.length > 0 && options.data.root.userSession.role_access.indexOf(access) >= 0) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        checkMultipleAccess: function (action, options) {
            var actions = action.split(',');
            if (options.data.root.userSession.role_access != undefined && options.data.root.userSession.role_access.length > 0) {
                for (var i in actions) {
                    if (options.data.root.userSession.role_access.indexOf(actions[i]) >= 0) {
                        return options.fn(this);
                    }
                }
                return options.inverse(this);
            } else {
                return options.inverse(this);
            }
        },
        toString: function (string) {
            if (string != undefined && string != null) {
                return string.toString();
            } else {
                return string
            }
        },
        humanize: function (string) {
            let humanizeString = require('humanize-string');
            return new Handlebars.SafeString(humanizeString(string));
        },

        pagination: function (pagination) {
            let html = '';
            if (pagination.total > pagination.limit) {
                let page = Math.ceil(pagination.total / pagination.limit);
                html = '<nav aria-label="Page navigation"><ul class="pagination justify-content-end mt-2">';
                var url_parts = pagination.url.split("?");
                var params = queryString.parse(url_parts[1]);
                delete params['p'];
                new_qry = queryString.stringify(params);
                new_url = url_parts[0] + "?" + new_qry;
                let pageList = range(pagination.page, page);
                for (let i in pageList) {
                    if (pageList[i] == '...') {
                        html += '<li class="page-item"><a class="page-link" href="javascript:void(0);">' + pageList[i] + '</a></li>';
                    } else {
                        let active = (pageList[i] == pagination.page) ? 'active' : '';
                        html += '<li class="page-item ' + active + '"><a class="page-link" href="' + new_url + '&p=' + pageList[i] + '">' + pageList[i] + '</a></li>';
                    }
                }
                html += '</ul></nav>';

                function range(c, m) {
                    var current = c || 1,
                        last = m,
                        delta = 2,
                        left = current - delta,
                        right = parseInt(current) + delta + 1,
                        range = [],
                        rangeWithEllipsis = [],
                        l,
                        t;

                    range.push(1);
                    for (var i = c - delta; i <= c + delta; i++) {
                        if (i >= left && i < right && i < m && i > 1) {
                            range.push(i);
                        }
                    }
                    range.push(m);

                    for (var i of range) {
                        if (l) {
                            if (i - l === 2) {
                                t = l + 1;
                                rangeWithEllipsis.push(t);
                            } else if (i - l !== 1) {
                                rangeWithEllipsis.push("...");
                            }
                        }
                        rangeWithEllipsis.push(i);
                        l = i;
                    }
                    return rangeWithEllipsis;
                }
            }
            return new Handlebars.SafeString(html);
        },
        dateFormat: function (datetime, format) {
            return moment(datetime).format('MM/DD/YYYY hh:mm:ss A');
        }
    })
};
