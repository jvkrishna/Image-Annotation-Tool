/**
 * Created by krishnaj on 6/12/17.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/',function(req,res) {
    res.render('login',{ message: req.flash('loginMessage') });
});

router.post('/',passport.authenticate('login',{
    successRedirect:'./dmiat',
    failureRedirect:'./login',
    failureFlash:true

}));

module.exports = router;