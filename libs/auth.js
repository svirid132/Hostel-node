const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const db = require('../db')

passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser((id, done) => {
  db.getUserById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null))
})


module.exports = (app, options) => {
    // if success and failure redirects aren't specified,
	// set some reasonable defaults
	if(!options.successRedirect)
        options.successRedirect = '/account'
    if(!options.failureRedirect)
        options.failureRedirect = '/login'

    return {
        init: function() {
        const config = options.providers

        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google/callback',
            scope: [ 'profile' ],
            state: true
        },
        function verify(accessToken, refreshToken, profile, done) {
            const authId = 'google:' + profile.id
            db.getUserByAuthId(authId)
            .then(user => {
                if(user) return done(null, user)
                db.addUser({
                authId: authId,
                name: profile.displayName,
                created: new Date(),
                role: 'customer',
                })
                .then(user => done(null, user))
                .catch(err => done(err, null))
            })
            .catch(err => {
                console.log('whoops, there was an error: ', err.message)
                if(err) return done(err, null);
            })
        }));

        app.use(passport.initialize())
        app.use(passport.session())
        },
        registerRoutes: () => {
        // register Google routes
        app.get('/auth/google', (req, res, next) => {
            if(req.query.redirect) req.session.authRedirect = req.query.redirect
            passport.authenticate('google', { scope: ['profile'] })(req, res, next)
        })
        app.get('/auth/google/callback', passport.authenticate('google',
            { failureRedirect: options.failureRedirect }),
            (req, res) => {
            // we only get here on successful authentication
            const redirect = req.session.authRedirect
            if(redirect) delete req.session.authRedirect
            res.redirect(303, req.query.redirect || options.successRedirect)
            }
        )
        },
    }
}