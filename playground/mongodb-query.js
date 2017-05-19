var {MongoClient} = require('mongodb');

var url = 'mongodb://pchalats:Panahs18s!@ds133291.mlab.com:33291/betserviceinfodb';

MongoClient.connect(url, (err, db) => {
    if (err) {
        return console.log('Could not connect to bet service info db');
    }

    var collection = db.collection('Events');
    collection.find({}).toArray((err, docs) => {
        console.log(`Found: ${docs.length} docs`);
        //console.log(docs);
    });

    db.close();
});

