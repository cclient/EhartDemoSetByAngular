/**
 * Module dependencies.
 */
var util = require('util'),
	url = require('url'),
	passport = require('passport'),
	OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
	InternalOAuthError = require('passport-oauth').InternalOAuthError;
/**
 * `Strategy` constructor.
 *
 * The yunoauth2 authentication strategy authenticates requests by delegating to
 * yunoauth2 using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your yunoauth2 application's client id
 *   - `clientSecret`  your yunoauth2 application's client secret
 *   - `callbackURL`   URL to which yunoauth2 will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new Thirty7SignalsStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/yunoauth2/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
	options = options || {};
	options.oAuthHost = options.oAuthHost || 'http://account.yun.com';
	options.authorizationURL = options.authorizationURL || (options.oAuthHost + '/dialog/authorize');
	options.tokenURL = options.tokenURL || (options.oAuthHost + '/oauth/token');
	OAuth2Strategy.call(this, options, verify);
	this.name = 'yunoauth2';
	this._options = options;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from yunoauth2.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `yunoauth2`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
	this._oauth2.get(this._options.oAuthHost + '/api/userinfo', accessToken, function (err, body) {
		if (err) {
			return done(new InternalOAuthError('failed to fetch user profile', err));
		}
		try {
			var json = JSON.parse(body),
				profile = {
					provider: 'yunoauth2',
					openID: json.openID,
					name: json.name,
					email: json.email
				};
			done(null, profile);
		} catch (e) {
			done(e);
		}
	});
};

/**
 * Expose `Strategy`.
 */
exports.Strategy = Strategy;


/** 
 * It is middleware for express
 * @param {Boolean} [options.session=true] - enable oauth session, You can access user data using "req.user" after successfully authenticated.
 */

exports.middleware = function (options) {
	if (!options) options = {};
	if (!options.session) options.session = true;
	var init = passport.initialize();
	var session = passport.session();
	return function (req, res, next) {
		init(req, res, function () {
			if (options.session ) {
				session(req, res, next);
			} else {
				next();
			}
		});
	};
};

var _serialize = function (user, done) {
	done(null, user);
};


/** 
 * It will add route to express app
 * @param {string} options.host - example www.abc.com:9000
 * @param {string} options.clientID
 * @param {string} [options.clientSecret='clientSecret']
 * @param {string} [options.authUrl='/yunoauth2']
 * @param {string} [options.successRedirect='/']
 * @param {string} [options.failureRedirect='/']
 */

exports.easyAuth = function (app ,options) {
	passport.serializeUser(_serialize);
	passport.deserializeUser(_serialize);

	var callbackUrl = url.format({protocol:'http:', host:options.host, pathname:'/yunoauth2/callback'});

	if(!(options.clientID && options.clientSecret)){
		throw new Error('invalid clientID and clientSecret');
	}

	passport.use(new Strategy({
			oAuthHost: options.oAuthHost || 'http://account.yunpro.cn',
			clientID: options.clientID,
			clientSecret: options.clientSecret || 'clientSecret',
			callbackURL: options.callbackUrl || callbackUrl
		},
		function (accessToken, refreshToken, profile, done) {
			done(null, profile);
		}
	));

	app.get(options.authUrl || '/yunoauth2', passport.authenticate('yunoauth2', { scope: ['email'] }));
	app.get('/yunoauth2/callback',
		passport.authenticate('yunoauth2',{
			failureRedirect: options.failureRedirect || '/',
			successRedirect: options.successRedirect || '/'
		})
	);
};
