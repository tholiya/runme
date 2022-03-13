var express = require('express');
var router = express.Router();
const passport = require('passport');

/**
 * Get route for display login page
 */
router.get('/', function (req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	} else {
		next();
	}
}, function (req, res, next) {
	res.render('index', {
		title: 'Logs Login',
		layout: 'login'
	});
});

/**
 * Post route for process login
 */
router.post('/', async function (req, res, next) {
	passport.authenticate('local', async function (err, user, info) {
		if (err || !user) {
			req.flash('error', info.message);
			return res.redirect('/');
		} else {
			//establish sesstion
			req.logIn(user, async function (err) {
				// Invalid password
				if (err) {
					req.flash('error', err.message);
					return res.redirect('/');
				} else {
					if (req.query.u) {
						return res.redirect(req.query.u);
					} else {
						return res.redirect('/dashboard');
					}
				}
			});
		}
	})(req, res, next);
});


/**
 * Get route for logout
 */
router.get('/logout', async function (req, res, next) {
	res.clearCookie('remember_me'); //clear cookie
	req.logout(); //passport logout method
	res.redirect('/');
});

module.exports = router;
