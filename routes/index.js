var queries = require("./querries.js");

var db = queries.db;
var ObjectId = queries.ObjectId;

exports.index = function(req, res) {

    db.conventions.find({}, { name: 1 }).sort({ name: 1 }, function(err, conventions) {
        if( err || !conventions) {
            console.log("No convention for found!");
        }

        res.render('index', {
            locals: {
                title: 'Welcome'
            },
            conventions: conventions || {}
        });
    });

};

exports.findConvention = function(req, res) {

    var conventionId = req.params.id;

    console.log("Getting convention " + conventionId);

    queries.getConById(conventionId, function(err, convention) {
        if( err || !convention) {
            console.log("No convention for found with id " + conventionId);

            res.redirect('/');
        } else {
            res.render('convention', {
                convention: convention,
                json: JSON.stringify(convention)
            });
        }
    });
};

exports.createConvetion = function(req, res) {

    console.log("Starting to create " + JSON.stringify(req.body));

    var name = req.body.name;

    var convention = {
        name: name
    };

    db.conventions.save(convention, function(err, convention) {
        if( err || !convention ) {
            console.log("Creating a convention failed!");

            res.redirect('/');
        } else {
            console.log("Convention created!");

            res.redirect('convention/' + convention._id);
        }
    });
};

exports.deleteConvention = function(req, res) {

    var conventionId = req.body.id;

    console.log("Starting to delete convention " + conventionId);

    db.conventions.remove({ _id: ObjectId(conventionId) }, function(err) {
        if( err ) {
            console.log("Removing convention failed for " + conventionId);
        } else {
            console.log("Convention removed " + conventionId);

            db.rooms.remove({ conId: ObjectId(conventionId) });
            db.events.remove({ conId: ObjectId(conventionId) });
        }

        res.redirect('/');
    });
};