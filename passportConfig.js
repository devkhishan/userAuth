const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function init(passport,getUserByEmail,getUserById){
    const authenticator = async (email, password, done) => {
        const user = getUserByEmail(email)
        if(user==null){
            return done(null, false, {message: 'User not found'})
        }
        
        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null,user)
            }
            else{
         
                return done(null, false, {message: 'Incorrect Password'})
            }

        }catch(e){
            return done(e)
        }
        
    }
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticator))
    passport.serializeUser((user,done) => done(null, user.id))
    passport.deserializeUser((id,done) => {
        return done(null, getUserById(id))
    }
    )
}

module.exports = init;