/**
 * Created by krishnaj on 6/12/17.
 */
var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
    teamName:String,
    teamId:String,
    users:[]
});

var Team = mongoose.model('Team',teamSchema);

module.exports = Team;