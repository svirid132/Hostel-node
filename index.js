require('dotenv').config()
const express = require('express')
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const createAuth = require('./libs/auth')

const app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore
}));

// security configuration
const auth = createAuth(app, {
	// baseUrl is optional; it will default to localhost if you omit it;
	// it can be helpful to set this if you're not working on
	// your local machine.  For example, if you were using a staging server,
	// you might set the BASE_URL environment variable to
	// https://staging.meadowlark.com
    baseUrl: process.env.BASE_URL,
    successRedirect: '/account',
    failureRedirect: '/unauthorized',
})

auth.init()
auth.registerRoutes()

const port = process.env.PORT || 3000

app.use('/account', (req, res) => {
    console.log('user: ', req.user)
    res.json({
        "JSON": "account!"
    })
})

app.use('/unauthorized', (req, res) => {
    res.json({
        "JSON": "unauthorized"
    })
})

app.use('/', (req, res) => {
    res.json({
        "JSON": "Hello world!"
    })
})

app.use((req, res) => {
    res.type('text/plain')
    res.status(404)
    res.send('404 - Не найдено')
})

app.use((err, req, res, next) => {
    console.error(err.message)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Ошибка сервера')
})

app.listen(port, () => console.log(
    `Express запущен на http://localhost:${port}; `
))