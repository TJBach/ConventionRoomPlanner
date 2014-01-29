var databaseUrl = "localhost:27017/convention_planner"; // "username:password@example.com/mydb"
var collections = ["conventions"];
var mongojs = require("mongojs");

var db = mongojs.connect(databaseUrl, collections);
var ObjectId = mongojs.ObjectId;

exports.index = function(req, res) {

    db.conventions.find().sort({ name: 1 }, function(err, conventions) {
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

    db.conventions.findOne({_id: ObjectId(conventionId)}, function(err, convention) {
        if( err || !convention) {
            console.log("No convention for found with id " + conventionId);

            res.redirect('/');
        } else {
            res.render('convention', {
                convention: convention
            });
        }
    });
};

exports.createConvetion = function(req, res) {

    console.log("Starting to create " + JSON.stringify(req.body));

    var name = req.body.name;

    db.conventions.save({ name: name }, function(err, convention) {
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
        }

        res.redirect('/');
    });
};