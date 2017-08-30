var express = require('express');
var router = express.Router();
var authenticator = require('../config/authenticator');
var User = require('../models/user');
var expressValidator = require('express-validator');
var utils = require('./utils');

/* GET home page. */
router.get('/', authenticator.authentication, function(req,res) {
  res.redirect('./dmiat');
});

router.get('/logout',function(req,res) {
  req.logout();
  res.redirect('./login');
});

router.get('/terms',authenticator.authentication,function(req,res) {
  var user = req.user;
  res.render('terms',{'name': user.name});
});

router.post('/terms',authenticator.authentication,function(req,res){
    req.checkBody('name','Name can\'t be empty').notEmpty();
    req.checkBody('email','Invalid Email').notEmpty().isEmail();
    var result = req.getValidationResult();
    req.getValidationResult().then(function(result){
        if(!result.isEmpty() ) {
            return res.render('terms',{'result':'error',errors:result.useFirstErrorOnly().array(),'name':req.user.name})
        }
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var terms = req.body;
        var user = req.user;
        terms.ip=ip;
        terms.agreed=true;
        if(user) {
            User.update({'username':user.username},{'$set':{'terms':terms}},function(err,result) {
                if(err) {
                    console.log(err);
                    res.send(err);
                }
                return res.redirect('./dmiat');
            });
        }
    });

});

router.get('/leaderboard',function(req,res){
    return res.render("leaderboard");
});

router.get('/getstats',function(req,res) {
    var selector = {teamName:{$nin:['test','admin','S&I']}};
    utils.aggregateResults(selector,function(err,results){
        if(err){
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    })
});

module.exports = router;
