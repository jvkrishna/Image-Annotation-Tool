/**
 * Created by krishnaj on 6/25/17.
 */
var User = require('../models/user');
var Annotation = require('../models/annotation');
var async = require('async');

module.exports.progressInfo = ProgressInfo;
module.exports.aggregateResults = aggregateResults;
module.exports.validateRegions = validateRegions;

function ProgressInfo(teamname) {
    this.teamname = teamname;
    this.imagesAssigned = 0;
    this.imagesAnnotated = 0;
    this.labels = 0;
    this.lastUpdateTime = 0;
    this.userProgress = [];
};

ProgressInfo.prototype.incrementLabeledCount = function(labels) {
    this.labels += labels;
};

ProgressInfo.prototype.setLastUpdateTime = function(lastUpdateTime) {
    this.lastUpdateTime = lastUpdateTime;
};
ProgressInfo.prototype.setImagesAssigned = function(imagesAssigned) {
    this.imagesAssigned = imagesAssigned;
};

ProgressInfo.prototype.setImagesAnnotated = function(imagesAnnotated) {
    this.imagesAnnotated = imagesAnnotated;
};

ProgressInfo.prototype.setLabels = function(labels) {
    this.labels = labels;
};
ProgressInfo.prototype.incrementImagesAssigned = function(imagesAssigned) {
    this.imagesAssigned += imagesAssigned;
};

ProgressInfo.prototype.incrementImagesAnnotated = function(imagesAnnotated) {
    this.imagesAnnotated += imagesAnnotated;
};




function aggregateResults(selector, callback) {
    var results = [];
    if(!selector) {
        selector  = {};
    }
    User.aggregate([{$match:selector},{$group:{_id:"$teamName",usernames:{$push:"$username"}}}],function(err,teams){
        if(err) {
            return callback(err);
        }
        async.each(teams,function(team,next){
            var teamProgressInfo = new ProgressInfo(team['_id']);
           var cursor = Annotation.aggregate([
                {$match:{'users.username':{$in:team.usernames}}},
                {$group:{
                    _id:'$users.username',
                    imagesAssigned:{$sum:1},
                    imagesAnnotated:{$sum:{$cond:{if :{$gt:['$content.regions',{}]}, then : 1, else:0 }}},
                    labelsArr:{$push:"$content.regions"},
                    lastUpdateTime:{$max:'$updated'}
                }
                }
            ]).cursor().exec();
           cursor.on('error',function(err) {
               next(err);
           });
            cursor.on('data',function(userProgress){
                        var userProgressInfo = {
                                username : userProgress['_id'].toString(),
                                imagesAssigned : userProgress['imagesAssigned'],
                                imagesAnnotated: userProgress['imagesAnnotated'],
                                lastUpdateTime: userProgress['lastUpdateTime'],
                                labels: 0
                            };
                            userProgress['labelsArr'].forEach(function (userRegions) {
                                userProgressInfo['labels'] += Object.keys(userRegions).length;
                            });
                            teamProgressInfo.incrementImagesAssigned(userProgressInfo['imagesAssigned']);
                            teamProgressInfo.incrementImagesAnnotated(userProgressInfo['imagesAnnotated']);
                            teamProgressInfo.incrementLabeledCount(userProgressInfo['labels']);
                            if (teamProgressInfo['lastUpdateTime'] < userProgressInfo['lastUpdateTime']) {
                                teamProgressInfo['lastUpdateTime'] = userProgressInfo['lastUpdateTime'];
                            }
                            teamProgressInfo['userProgress'].push(userProgressInfo);
                        });
                        teamProgressInfo['userProgress'].sort(function(a,b){
                            return b['labels'] - a['labels'];
            });
            cursor.on('end',function() {
                results.push(teamProgressInfo);
                next();
            })

        }, function(err){
            if(err)
                callback(err);
            else{
                results.sort(function(a,b){
                   return b.labels - a .labels;
                });
                callback(null,results);
            }

        })

    })
}

function validateRegions(selector, callback) {

    var totalLabels =0;
    var totalImages = 0;
    var results = [];
    var userResults = {};
    if(!selector) {
        selector  = {};
    }

    Annotation.find(selector,function(err,annotations) {
        console.log("Annotations Size:", annotations.length);
        async.each(annotations, function (annotation,next) {
            if(annotation.content && annotation.content.regions) {
                var imageNegLabels = 0;
                Object.values(annotation.content.regions).forEach(function (userRegion) {
                    var shape_attribute = userRegion['shape_attributes'];
                    if (shape_attribute) {
                        switch (shape_attribute['name']) {
                            case ('rect') :
                                if (shape_attribute['x'] < 0 || shape_attribute['y'] < 0 || shape_attribute['width'] < 0 || shape_attribute['heigh'] < 0) {
                                    imageNegLabels++;
                                }
                                break;
                            case ('circle') :
                                if (shape_attribute['r'] < 0 || shape_attribute['cy'] < 0 || shape_attribute['cx'] < 0) {
                                    imageNegLabels++;
                                }
                                break;
                            case ('ellipse') :
                                if (shape_attribute['rx'] < 0 || shape_attribute['ry'] < 0 || shape_attribute['cx'] < 0 || shape_attribute['cy'] < 0) {
                                    imageNegLabels++;
                                }
                                break;
                            case ('polygon') :
                                for (var i = 0; i < shape_attribute['all_points_x'].length; i++) {
                                    if (shape_attribute['all_points_x'][i] < 0 || shape_attribute['all_points_y'][i] < 0) {
                                        imageNegLabels++;
                                    }
                                }
                                break;
                        }
                    }
                })
                if(imageNegLabels > 0) {
                    totalLabels += imageNegLabels;
                    totalImages++;
                    results.push(annotation['imageURL']);
                }
            }
            next(err);
        }, function(err) {
            callback(err,{totalLabels:totalLabels,totalImages:totalImages,images:results})
        })
    })
}
module.exports.createDefaultAdmin = function(cb) {
    User.findOne({'username':'admin'},function(err,user){
        if(err){
            cb(err);
        }
        if(!user) {
            //First time setup. Create a new admin user.
            var newUser = new User({
                name:'Admin',
                teamName:'admin',
                username:'admin',
                password:new User().generateHash('admin'),
                roles:['admin']
            });
            newUser.save(function (err) {
                cb(err);
            })
        }
    })
};