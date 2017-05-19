const mongoose = require('mongoose');

const Selection = mongoose.Schema({
    title: String,
    odds: String,
    select_id: String
});

const Event = mongoose.model('Event', {
    title: {
        type: String
    },
    event_id: {
        type: String
    },
    event_date: {
        type: Date
    },
    starts_at: {
        type: Number
    },
    sport: {
        type: String
    },
    selection: [Selection]
}, "Events");

module.exports = { Event };