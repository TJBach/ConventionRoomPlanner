(function(){
    "use strict";

    var planner = new room_planner.RoomPlanner();

    //Bootstrap some test data
    planner.startDate(new Date(2013, 9, 22, 7));
    planner.endDate(new Date(2013, 9, 23, 12));

    planner.rooms([
        new room_planner.Room(planner, "Room 123"),
        new room_planner.Room(planner, "Room 124"),
        new room_planner.Room(planner, "Room 223"),
        new room_planner.Room(planner, "Room 224"),
        new room_planner.Room(planner, "Ball Room")
    ]);
    var rooms = planner.rooms();

    rooms[0].addEvent("Test 1", new Date(2013, 9, 22, 8, 30), new Date(2013, 9, 22, 10, 30));
    rooms[1].addEvent("Test 2", new Date(2013, 9, 22, 8, 0), new Date(2013, 9, 22, 9, 0));
    rooms[1].addEvent("Test 3", new Date(2013, 9, 22, 9, 30), new Date(2013, 9, 22, 12, 0));

    //star the binding
    ko.applyBindings(planner);
}).call(this);
