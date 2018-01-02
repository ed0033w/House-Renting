var express = require('express')
var router = express.Router()

var mysql = require('../library/mysql.js')

mysql.connect()

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index')
})

router.get('/fund', function (req, res, next) {
	res.render('fund')
})

router.get('/generic', function (req, res, next) {
	res.render('generic')
})

router.get('/house', function (req, res, next) {
	res.render('house')
})

router.get('/info', function (req, res, next) {
	res.render('info')
})

router.get('/info', function (req, res, next) {
	res.render('info')
})

router.get('/info2', function (req, res, next) {
	res.render('info2')
})

router.get('/login', function (req, res, next) {
	res.render('login')
})

router.get('/personal', function (req, res, next) {
	res.render('personal')
})

router.get('/post', function (req, res, next) {
	res.render('post')
})

router.get('/register', function (req, res, next) {
	res.render('register')
})

//post
router.post('/sign_in', async function (req, res, next) {
	console.log('sign_ip-post')
	console.log(req.body)

	let result = await mysql.sing_in(req.body.ID, req.body.password)
    if (result.type === 1) {
        req.session.user_ID = result.ID
        req.session.user_name = result.name
    }
    res.json(result)
})

//post
router.post('/sign_up', async function (req, res, next) {
    console.log('sign_up-post')
    console.log(req.body)
    let user = req.body
    let result = await mysql.sing_up(user.ID, user.password, user.name, user.email, user.phone)
    if (result.type) {
        req.session.user_ID = user.ID
        req.session.user_name = user.name
    }
    res.json(result)
})


module.exports = router;
