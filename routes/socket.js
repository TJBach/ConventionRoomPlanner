var _ = require('underscore');
var queries = require("./querries.js");

var db = queries.db;
var ObjectId = queries.ObjectId;

var routes = function(app){
    var package = {};

    package.chatRoutes = {
        setAlias: function(req) {
            var name = req.data;

            var oldName = app.io.get('pseudo') || 'New user';
            var viewedCons = app.io.get('conventions') || [];

            if(name && name !== oldName){
                app.io.set('pseudo', name);

                for(var i = 0; i < viewedCons.length; i++){
                    req.io.room(viewedCons[i]).broadcast('chat:message', {
                        message: '* ' + oldName + ' is now known as ' + name + '. *',
                        pseudo : ''
                    });
                }

                //update other windows you may have open.
                req.io.emit('client:name', name);
            }

            console.log(oldName + " set alias to " + name);
        },
        message: function(req) {
            var message = req.data.message;
            var convention = req.data.convention;

            var name = app.io.get('pseudo');

            if(name && convention && message){
                var data = { 'message' : message, pseudo : name };

                req.io.room(convention).broadcast('chat:message', data);

                console.log("user " + name + " said to " + convention + " : " + message);
            }
        }
    };

    package.conventionRoutes = {
        connect: function(req){
            var conventionId = req.data;

            req.io.join(conventionId);

            var name = app.io.get('pseudo');
            var display = name || "New user";

            req.io.room(conventionId).broadcast('chat:message', {
                message: '* ' + display + ' has connected. *',
                pseudo : ''
            });

            if(name){
                req.io.emit('client:name', name);
            }

            //track cons we are watching.
            var cons =_.union((app.io.get('conventions') || []), [conventionId]);
            app.io.set('conventions', cons);

            console.log("user " + name + " joined " + conventionId);
        }
    };

    package.roomRoutes = {
        add: function(req){
            req.data.conId = ObjectId(req.data.conId);

            var data = {
                conId: req.data.conId,
                name: req.data.name
            };

            db.rooms.insert(data, function(err, room) {
                if(err){
                    console.log("Adding room failed for " + req.data.name);
                } else {
                    console.log("Adding room " + req.data.name);
                    app.io.room(room.conId).broadcast('room:add', room);
                }
            });
        },
        update: function(req){
            req.data._id = ObjectId(req.data._id);
            req.data.conId = ObjectId(req.data.conId);

            var data = {
                name: req.data.name
            };

            db.rooms.findAndModify({
                query: { _id : req.data._id },
                update: { $set: data },
                new: true
            }, function(err, room) {
                if(err){
                    console.log("Updating room failed for " + req.data.name);
                } else {
                    console.log("Updating room " + room.name);
                    req.io.room(room.conId).broadcast('room:update', room);
                }
            });
        },
        remove: function(req){
            db.rooms.remove({ _id: ObjectId(req.data._id) }, function(err) {
                if( err ) {
                    console.log("Removing room failed for " + req.data.name);
                } else {
                    console.log("Removing room " + req.data.name);
                    req.io.room(req.data.conId).broadcast('room:remove', {
                        _id : req.data._id,
                        conId : req.data.conId
                    });
                    db.events.remove({ roomId: ObjectId(req.data.roomId) });
                }
            });
        },
        reserve: function(req){
            console.log("Release room " + req.data._id);
            req.io.room(req.data.conId).broadcast('room:reserve', {
                _id : req.data._id,
                conId : req.data.conId,
                user : app.io.get('pseudo') || "anaynomous"
            });
        },
        release: function(req){
            console.log("Release room " + req.data._id);
            req.io.room(req.data.conId).broadcast('room:release', {
                _id : req.data._id,
                conId : req.data.conId
            });
        }
    };

    var releaseEvent = function(req){
        console.log("Release event " + req.data._id);
        req.io.room(req.data.conId).broadcast('event:release', {
            _id : req.data._id,
            conId : req.data.conId,
            roomId : req.data.roomId
        });
    };

    package.eventRoutes = {
        add: function(req){
            req.data.conId = ObjectId(req.data.conId);
            req.data.roomId = ObjectId(req.data.roomId);

            var data = {
                roomId: req.data.roomId,
                name: req.data.name,
                start: req.data.start,
                end: req.data.end,
                color: req.data.color
            };

            db.events.insert(data, function(err, event) {
                if(err){
                    console.log("Adding event failed for " + req.data.name);
                } else {
                    console.log("Adding event " + req.data.name);
                    app.io.room(event.conId).broadcast('event:add', event);
                }
            });
        },
        update: function(req){
            req.data._id = ObjectId(req.data._id);
            req.data.conId = ObjectId(req.data.conId);
            req.data.roomId = ObjectId(req.data.roomId);

            var data = {
                conId: req.data.conId,
                roomId: req.data.roomId,
                name: req.data.name,
                start: req.data.start,
                end: req.data.end,
                color: req.data.color
            };

            db.events.findAndModify({
                query: { _id : req.data._id },
                update: { $set: data },
                new: true
            }, function(err, event) {
                if(err){
                    console.log("Updating event failed for " + req.data.name);
                } else {
                    console.log("Updating event " + req.data.name);
                    req.io.room(event.conId).broadcast('event:update', event);
                }
                releaseEvent(req);
            });
        },
        remove: function(req){
            db.events.remove({ _id: ObjectId(req.data._id) }, function(err) {
                if( err ) {
                    console.log("Removing event failed for " + req.data.name);
                } else {
                    console.log("Removing event " + req.data.name);
                    req.io.room(req.data.conId).broadcast('event:remove', {
                        _id : req.data._id,
                        conId : req.data.conId,
                        roomId : req.data.roomId
                    });
                }
            });
        },
        reserve: function(req){
            console.log("Reserve event " + req.data._id);
            req.io.room(req.data.conId).broadcast('event:reserve', {
                _id : req.data._id,
                conId : req.data.conId,
                roomId : req.data.roomId,
                user : app.io.get('pseudo') || "anaynomous"
            });
        },
        release: releaseEvent
    }

    return package;
};

module.exports = routes;

