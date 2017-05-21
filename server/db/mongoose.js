const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://pchalats:Panahs18s!@ds133291.mlab.com:33291/betserviceinfodb');
mongoose.set('debug', true);
//mongoose.connect('mongodb://localhost:27017/betserviceinfodb');

module.exports = { mongoose };