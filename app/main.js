(function(){
    "use strict";

    //ko.computed.deferUpdates = false;

    //Bootstrap some test data
    var planner = new room_planner.Grid(conventionId, new Date(2013, 9, 22, 7), new Date(2013, 9, 23, 12));

    var roomOne = planner.addRoom("Room 123");
    var roomTwo = planner.addRoom("Room 223");
    var roomThree = planner.addRoom("Room 224");
    var roomFour =planner.addRoom("Ball Room");

    roomOne.addEvent("Test 1", new Date(2013, 9, 22, 8, 30), new Date(2013, 9, 22, 10, 30));
    roomTwo.addEvent("Test 2", new Date(2013, 9, 22, 8, 0), new Date(2013, 9, 22, 9, 0));
    roomTwo.addEvent("Test 3", new Date(2013, 9, 22, 9, 30), new Date(2013, 9, 22, 12, 0));
    roomThree.addEvent("Overlap 1", new Date(2013, 9, 22, 10, 0), new Date(2013, 9, 22, 12, 0));
    roomThree.addEvent("Overlap 2", new Date(2013, 9, 22, 11, 30), new Date(2013, 9, 22, 13, 0));
    roomFour.addEvent("Overlap 3", new Date(2013, 9, 22, 7, 30), new Date(2013, 9, 22, 15, 0));
    roomFour.addEvent("Overlap 4", new Date(2013, 9, 22, 10, 0), new Date(2013, 9, 22, 11, 0));
    roomFour.addEvent("Overlap 5", new Date(2013, 9, 22, 9, 30), new Date(2013, 9, 22, 12, 0));
    roomFour.addEvent("Overlap 6", new Date(2013, 9, 22, 12, 30), new Date(2013, 9, 22, 13, 0));

    //star the binding
    ko.applyBindings(planner);

    var socket = room_planner.getSocket();

    socket.emit('convention:connect', conventionId);

}).call(this);
