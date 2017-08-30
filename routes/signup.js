/**
 * Created by krishnaj on 6/12/17.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticator = require('../config/authenticator');

router.get('/',authenticator.checkACL('admin'), function(req,res){
    res.render('signup', { message: req.flash('signupMessage') });
});

router.post('/', authenticator.checkACL('admin'),passport.authenticate('signup', {
    successRedirect : './users', // redirect to the secure profile section
    failureRedirect : './signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

module.exports = router;