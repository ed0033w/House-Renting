var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index')
})

router.get('/elements', function (req, res, next) {
	res.render('elements')
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

module.exports = router;
