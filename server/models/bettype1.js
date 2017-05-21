var mongoose = require('mongoose');

var BetTypeSchema = mongoose.Schema({
    title: {
        type: String
    },
    code: {
        type: String
    },
    description: {
        type: String
    },
    selections: {
        type: Number
    }
});

var BetType = mongoose.model('BetType', BetTypeSchema, 'BetType');

module.exports = { BetType };