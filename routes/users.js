var express = require('express');
var router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
var { paginationSort } = require('../common/middleware');

/* GET users listing. */
router.get('/', paginationSort, async function (req, res, next) {
	try {
		let condition = {
			deleted: false
		};
		let users = await db('cron_user').aggregate([{
			$match: condition
		}, {
			$sort: req.pageSort.sort
		}, {
			$skip: req.pageSort.skip
		}, {
			$limit: req.pageSort.limit
		}, {
			$project: {
				_id: 1,
				name: 1,
				role: 1,
				email: 1,
				phone: 1,
				status: 1,
			}
		}]);
		let userCount = await db('cron_user').countDocuments(condition);
		res.render('users/index', {
			title: 'Users',
			users: users,
			pagination: {
				limit: req.pageSort.limit,
				page: req.pageSort.page,
				total: userCount,
				url: req.originalUrl
			}
		});
	} catch (error) {
		console.log(error);
		res.render('users/index', {
			title: 'Users',
			users: [],
			pagination: {}
		});
	}
});


router.get('/change-password', async function (req, res, next) {
	res.render('users/change-password', {
		title: 'Change Password',
	});
});

router.post('/change-password', async function (req, res, next) {
	try {
		let saltedSha512 = require('salted-sha512');
		let checkPassword = await db('cron_user').countDocuments({
			_id: req.user._id,
			password: saltedSha512(req.body.current_password, process.env.SALTKEY)
		});
		if (checkPassword > 0) {
			if (req.body.password == req.body.conform_password) {
				req.body.password = saltedSha512(req.body.password, process.env.SALTKEY),
					await db('cron_user').updateOne({
						_id: req.user._id
					}, {
						password: req.body.password
					});
				req.flash('success', 'Password changed successfully');
			} else {
				req.flash('error', 'Conform Password must be as same as password');
			}
		} else {
			req.flash('error', 'Please enter valid current password');
		}
		return res.redirect('/users/change-password');
	} catch (error) {
		req.flash('error', error.message);
		return res.redirect('/users/change-password');
	}
});
module.exports = router;
