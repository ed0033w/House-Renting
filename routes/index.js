var express = require('express')
var router = express.Router()

var mysql = require('../library/mysql.js')
var sign = async function (req, res, next) {
    if (req.session.user_ID && req.session.user_name) {
        next()
    }
    else {
        res.redirect('register')
    }
}
mysql.connect()

/* GET page. */
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


router.get('/personal', sign, async function (req, res, next) {
    let user = await mysql.getUserByID(req.session.user_ID)

    res.render('personal', { user_name: req.session.user_name, user_ID: user.ID, user_email: user.email, user_phone: user.phone })
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

router.post('/lease', async function (req, res, next) {
    console.log('lease-post')
    console.log(req.body)

    //let result = await mysql.addContract(req.body.name, req.body.phone, req.body.address, req.body.deposit, req.body.email, req.body.ping, req.body.rent)

    res.json({ type: true })
})

module.exports = router;
