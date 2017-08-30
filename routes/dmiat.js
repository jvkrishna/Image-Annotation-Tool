/**
 * Created by krishnaj on 6/12/17.
 */
var express = require('express');
var router = express.Router();
var authenticator = require('../config/authenticator');
var Annotation = require('../models/annotation');

router.get('/',authenticator.authentication,authenticator.termsAgreed,function(req,res){
   var user = req.user;
   res.render('dmiat',{'name':user.name});
});

router.get('/getimages',authenticator.authentication, function (req,res) {
   var user = req.user;
   Annotation.find({'users.username':user.username},function(err,docs){
      if(err) {
        console.log('Failed to retrieve images.');
        res.send(err);
      } else {
        var documents = [];
        docs.forEach(function(annotation){
           documents.push(annotation.imageURL);
        });
        res.json(documents);
      }
   });
});

router.post('/read',authenticator.authentication, function(req,res){
   var images =req.body;
   Annotation.find({'imageURL':{$in:images}},function(err,docs){
       if(err) {
           console.log(err);
           res.send(err);
       }
       var response = {},imageURL,content;
       response.files = {};
       response.files.content = {};
       docs.forEach(function(annotation){
          imageURL = annotation.imageURL;
          content = annotation.content;
          response.files.content[imageURL] = content;
       });
       res.json(response);

   });
});

router.post('/save',authenticator.authentication,function(req,res){
    var data = req.body['files']['content'];
    var keys = Object.keys(data);
    var count = 0;
    var user = req.user;
    keys.forEach(function(key) {
        var value = data[key];
        Annotation.update({"imageURL":key,"users.username":user.username},{$set:{"content":value,"updated":Date.now()}}, function(err,result){
            if(err) {
                console.log(err);
                res.send(err);
            }
            if(++count == keys.length){
                res.json(req.body);
            }

        });
    });

});

router.get('/getlatest',authenticator.authentication,function(req,res){
   var user = req.user;
   Annotation.findOne({'users.username':user.username}).sort({'updated':-1}).select('imageURL').exec(function(err,doc){
        res.json(doc);
   });

});
module.exports = router;