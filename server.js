if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express() 
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')


const init = require('./passportConfig')
init(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = [] 

app.set('view-engine','ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuth, (req,res) => {
    res.render('index.ejs', { username : req.user.name})
})


app.get('/login', checkNotAuth, (req,res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.get('/register', checkNotAuth, (req,res) => {
    res.render('register.ejs')
})

app.post('/register', async (req,res)=>{
    try{
        const hashedPass = await bcrypt.hash(req.body.password, 12)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPass
        })
        res.redirect('/login')
    }catch{
       
        res.redirect('/register')
    }
})

function checkAuth(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    return res.redirect('/login')
}

function checkNotAuth(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}


app.listen(3000)