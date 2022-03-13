/**
 * authService is used for create function related to authorization
 */
let CryptoJS = require("crypto-js");
const saltedSha512 = require('salted-sha512');
module.exports = {
	login: function (app) {
		// create object of passposrt authentication and strategy
		const passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
		app.use(passport.initialize());
		app.use(passport.session());
		//user login through passport js using mongo DB
		passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
			/**function for login user
			 * @param  {string} username
			 * @param  {string} password
			 * @param  {Function} done
			 * @return {[type]}
			 */
			function (req, username, password, done) {
				// find user by email
				db('cron_user').findOne({
					'email': username.toLowerCase(),
					deleted: false
				}, {
					name: 1,
					phone: 1,
					password: 1,
					email: 1,
					deleted: 1,
					status: 1
				}).then(async function (user) {
					// if user not found
					if (!user) {
						return done(null, false, {
							message: 'Please enter valid login details'
						});
					} else {
						user = user.toObject();
						// check login password
						if (saltedSha512(password, process.env.SALTKEY) != user.password) {
							return done(null, false, {
								message: 'Please enter valid login details'
							});
						}
						// check user must active and not deleted
						if (user.status != "active" || user.deleted) {
							return done(null, false, {
								message: 'User is inactive or deleted. Please contact admin'
							});
						}

						delete user.password;
						return done(null, user);
					}
					// handle catch 
				}).catch(function (err) {
					console.log('Error when user try to login');
					console.log(err);
					return done(null, false, {
						message: 'Please enter valid login details'
					});
				});
			}
		));

		passport.serializeUser(function (user, done) {
			let cipherText = { logout: true };
			try {
				cipherText = CryptoJS.AES.encrypt(JSON.stringify(user), process.env.CIPHER_KEY).toString();
			} catch (error) {
				console.log('encription error');
				console.log(error);
			}
			done(null, cipherText);
		});

		passport.deserializeUser(function (user, done) {
			let data = { logout: true };
			try {
				let plaintext = CryptoJS.AES.decrypt(user, process.env.CIPHER_KEY);
				data = JSON.parse(plaintext.toString(CryptoJS.enc.Utf8));
			} catch (error) {
				console.log('Decription error');
				console.log(error);
			}
			done(null, data);
		});
	},

	checkAuth: function (req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.logout != undefined && req.user.logout == true) {
				res.clearCookie('remember_me'); //clear cookie
				req.logout(); //passport logout method
				//set flash message
				req.flash('error', "Please login to access this page.");
				//redirect to requested page
				res.redirect('/?u=' + req.originalUrl);
			}
			return next(); //return next
		}
		//set flash message
		req.flash('error', "Please login to access this page.");
		//redirect to requested page
		res.redirect('/?u=' + req.originalUrl);
	}
}