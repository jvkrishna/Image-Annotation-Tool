/**
 * Created by krishnaj on 6/13/17.
 */
var express = require('express');
var router = express.Router();
var authenticator = require('../config/authenticator');
var utils = require('./utils');
var User = require('../models/user');
var Annotation = require('../models/annotation');

var createUser = function(req) {
    var newUser = new User();
    newUser.name = req.body.name;
    newUser.teamName= req.body.teamName;
    newUser.username=req.body.username;
    newUser.password=newUser.generateHash(req.body.password);
    newUser.roles=req.body.roles;
    return newUser;
};

/**
 * Create user
 */
router.post('/user/create',authenticator.validateToken,function(req,res){
    var newUser = createUser(req);
    newUser.save(function(err){
       if(err)
           res.send(err);
       res.json(newUser);
    });
});

/**
 * Update User
 */
router.post('/user/update',authenticator.validateToken,function(req,res){
    var newUser = createUser(req);
    User.findOne({'username':newUser.username},function(err,user){
       if(err) {
           res.send(err);
       }
       console.log(user);
       if(!user)
           res.send("No user found.");
         if(req.body.name)
             user.name = req.body.name;
         if(req.body.teamName)
             user.teamName = req.body.teamName;
         if(req.body.password)
             user.password = user.generateHash(req.body.password);
         if(req.body.roles)
             user.roles = req.body.roles;
         user.save(function(err){
            if(err) res.send(err);
             return res.json(user);
         });

    });

});

/**
 * Create Image Meta Data.
 */
router.post('/image/create',authenticator.validateToken,function(req,res){
    var annotation = new Annotation(req.body);
    annotation.save(function(err){
       if(err)
           res.send(err);
       res.json(annotation);
    });
});

/**
 * Check Teams progress.
 */
router.get('/progressinfo/:teamname?',authenticator.validateToken, function(req,res){
    var teamname = req.params.teamname;
    var results  = [];
    var selector = {};
    if(teamname) {
        selector.teamName = teamname;
    }
    utils.aggregateResults(selector,function(err,results){
       if(err) {
           res.status(500).send(err);
       }  else {
           res.json(results);
       }
    });
});



module.exports = router;
