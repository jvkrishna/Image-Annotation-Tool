/**
 * Created by krishnaj on 6/12/17.
 */

var passport = require('passport');
var User = require('../models/user');

module.exports.authentication = checkAuthentication;
module.exports.checkACL = checkACL;
module.exports.termsAgreed = termsAgreed;
module.exports.validateToken = validateToken;
var token= 'someRandomAccessToken-UpdateThisValue';

function checkAuthentication(req,res,next) {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect('./login');
    }
};

function checkACL(role) {
   return function(req,res,next) {
        if(!req.user)
           return res.redirect('./login');
        var user = req.user;
        User.findById(user._id,function(err,user){
            if(err) {
                res.status(401).json({error: 'No user found.'});
            }
            if(user.roles.indexOf(role) > -1) {
                return next();
            } else {
                res.status(401).json({error: 'You are not authorized to view this content'});
            }
        })
   };
}

function termsAgreed(req,res,next) {
    var user = req.user;
    if(!user) {
        return res.redirect('./login');
    }
    //Disabled the terms page
    // if(!user.terms || !user.terms.agreed) {
    //    return res.redirect('./terms');
    // }
    next();
}

function validateToken(req,res,next) {
    var reqToken = req.query.accesstoken;
    if(!reqToken || reqToken != token) {
        return res.status(401).send({'message':'You are not authorized to do this action.'});
    } else {
        next();
    }
}
