const express = require('express');
const passport = require('passport');
const { Router } = express;
const { getLogged, getLogout, postLogin, postRegister } = require("../controllers/auth");
// const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const mongoUsers = require('../index');

const passwordCheck = (user, password) => {
    return bcrypt.compareSync(password, user.password);
}

passport.use('login', new LocalStrategy(
    async (username, password, done) => {
        let user = await mongoUsers.getByUsername(username);
        console.log(user[0]);
        if(user[0]){
            if(passwordCheck(user[0], password)){
                console.log('dentro');
                return done(null, user[0]);
            } else{
                console.log('Invalid Password');
                return done(null, false);
            }
        } else{
            console.log('User not found');
            return done(null, false);
        }
    }
));



passport.use('signup', new LocalStrategy({
    passReqToCallback: true
}, async (req, username, password, done) => {
        let user = await mongoUsers.getByUsername(username);
        if(user[0]){
            console.log('User Already Exists');
            return done(null, false);
        } else{
            const newUser = {
                username: username,
                password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
                email: req.body.email
            }

            try {
                return done(null, await mongoUsers.save(newUser));
            } catch (error) {
                return done(error);
            }
        }
    }
));


const authRouter = new Router();

authRouter.get('/logged', getLogged);

authRouter.get('/logout', getLogout);

authRouter.post('/login', passport.authenticate('login'), postLogin);

authRouter.post('/register', passport.authenticate('signup'), postRegister);

module.exports = { authRouter };