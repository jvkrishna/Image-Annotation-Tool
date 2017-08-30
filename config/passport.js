/**
 * Created by krishnaj on 6/12/17.
 */

var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {

    //Put user id in the session.
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    //Resolve user from the session.
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    //TODO - Signup functionality. Use request middlewares.
    passport.use('signup', new LocalStrategy({
        passReqToCallback:true
    },function(req,username,password,done){
        process.nextTick(function(){
            User.findOne({'username':username},function(err,user){
                if(err)
                    return done(err);
                if(user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    var newUser = new User();
                    newUser.name = req.body.name;
                    newUser.teamName= req.body.teamName;
                    newUser.username=username;
                    newUser.password=newUser.generateHash(req.body.password);
                    newUser.roles=req.body.roles.split(',');
                    newUser.save(function(err){
                        if(err)
                            throw err;
                        console.log("added");
                        return done(null,newUser);
                    })
                }

            })
        })
    }));

    //Login Functionality
    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            User.findOne({'username': username}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'Invalid username/password.'));
                }
                if (!user.validatePassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'invalid username/password.'));
                }

                return done(null, user);

            })
        }
        )
    )
};