(function(){
    "use strict";

    //ko.computed.deferUpdates = false;

    var id = conventionId;

    var loadGrid = function(convention){
        var planner = new room_planner.Grid(convention);

        var rooms = convention.rooms || [];
        var room, events, event;

        for(var i = 0; i < rooms.length; i++){
            room = planner.addRoom(rooms[i]);

            events = rooms[i].events || [];

            for(var z = 0; z < events.length; z++){
                event = room.addEvent(events[z])
            }
        }

        return planner;
    };

    var socket = room_planner.getSocket();

    socket.emit('convention:connect', id);

    var planner = loadGrid(convention);

    //room messages
    socket.on('room:add', function(data) {
        planner.addRoom(data[0]);
    });

    socket.on('room:update', function(data) {
        var room = planner.findRoom(data._id);

        room.name(data.name);
        room.description(data.description);
    });

    socket.on('room:remove', function(data) {
        var room = planner.findRoom(data._id);

        planner.removeRoom(room);
    });

    socket.on('room:reserve', function(data) {
        var room = planner.findRoom(data._id);

        room.reserve(data.user);
    });

    socket.on('room:release', function(data) {
        var room = planner.findRoom(data._id);

        room.reserve(false);
    });

    //event messages
    socket.on('event:add', function(data) {
        data = data[0];
        var room = planner.findRoom(data.roomId);

        room.addEvent(data);
    });

    socket.on('event:update', function(data) {
        var event = planner.findEvent(data._id);

        event.name(data.name);
        event.start(new Date(data.start));
        event.end(new Date(data.end));
        event.color(data.color);

        if(event.roomId() != data.roomId){
            var sourceRoom = planner.findRoom(event.roomId());
            var desitinationRoom = planner.findRoom(data.roomId);

            sourceRoom.events.remove(event);
            desitinationRoom.events.push(event);
        }

        event.roomId(data.roomId);
    });

    socket.on('event:remove', function(data) {
        var room = planner.findRoom(data.roomId);
        var event = planner.findEvent(data._id);

        room.removeEvent(event);
    });

    socket.on('event:reserve', function(data) {
        var event = planner.findEvent(data._id);

        event.reserve(data.user);
    });

    socket.on('event:release', function(data) {
        var event = planner.findEvent(data._id);

        event.reserve(false);
    });

    //star the binding
    ko.applyBindings(planner);

}).call(this);
