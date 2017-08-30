/**
 * Created by krishnaj on 6/12/17.
 */
var mongoose = require('mongoose');

var annotationSchema = mongoose.Schema({
    imageURL:String,
    content: {
        fileref:String,
        size:Number,
        filename:String,
        base64_img_data:String,
        file_attributes:mongoose.SchemaTypes.Mixed,
        regions:mongoose.SchemaTypes.Mixed
    },
    users:[{
        username:String
    }],
    evaluations: {
        evaluatedBy:String,
        score:Number,
        completed:Boolean
    },
    updated:{type:Date,default:Date.now}
},{strict:false
});

var Annotation = mongoose.model('Annotation',annotationSchema);

module.exports = Annotation;

