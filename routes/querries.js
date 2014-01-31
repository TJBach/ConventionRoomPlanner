var _ = require('underscore');
var databaseUrl = "localhost:27017/convention_planner"; // "username:password@example.com/mydb"
var collections = ["conventions", "rooms", "events"];
var mongojs = require("mongojs");

var db = mongojs.connect(databaseUrl, collections);
var ObjectId = mongojs.ObjectId;

exports.ObjectId = ObjectId;
exports.db = db;

exports.getConById = function(id, callback){
    var convention, rooms, events;
    var error;

    var queryCallback = function(set){
        return function(err, result){
            var i, z;

            if( err || !result) {
                error = err || "failed";
                console.log("failed query!");
            } else {
                set(result);
            }

            var finished = convention && rooms && events;
            if(finished){
                console.log("Found con " + convention._id + " with " + rooms.length + " rooms and " + events.length + " events.");
                for(i = 0; i < rooms.length; i++){
                    rooms[i].events = _.filter(events, function(event){
                        return rooms[i]._id.toString() == event.roomId.toString(); //apparently v8 cannot compare object ids.
                    });
                }
                convention.rooms = rooms;
            }
            if(error || finished){
                callback(error, convention);
            }
        };
    };

    var conCallback = queryCallback(function(result){ convention = result; });
    var roomsCallback = queryCallback(function(result){ rooms = result; });
    var eventsCallback = queryCallback(function(result){ events = result; });

    db.conventions.findOne({_id: ObjectId(id)}, conCallback);
    db.rooms.find({conId: ObjectId(id)}, roomsCallback);
    db.events.find({conId: ObjectId(id)}, eventsCallback);
};