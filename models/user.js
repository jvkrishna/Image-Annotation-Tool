/**
 * Created by krishnaj on 6/12/17.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    name:String,
    teamName:String,
    username:String,
    password:String,
    email:String,
    terms:{
        agreed:Boolean,
        name:String,
        email:String,
        ip:String
    },
    roles:[]
},{strict:false
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password,this.password);
};

var User = mongoose.model('User',userSchema);

module.exports = User;