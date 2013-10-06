(function(){
    "use strict";

    window.room_planner = window.room_planner || {};
    window.room_planner.factor = 30 * 60000;
    window.room_planner.cellHeight = 50;
    window.room_planner.getHeight = function(){
        return window.room_planner.factor * window.room_planner.cellHeight;
    };

    room_planner.Room = function(grid, name){
        var self = this;

        self.name = ko.observable(name);
        self.events = ko.observableArray();
        self.rows = grid.rows;
        self.template = "room-template";

        self.setEventOverlap = function(events){
            var i;

            for(i = 0; i < events.length; i++){
                events[i].overlap(1);
                events[i].shift(0);
            }

            for(i = 0; i < events.length; i++){
                events[i].setOverlaps(events, i+1);
            }
        };

        self.addEvent = function(name, start, end){
            self.events.push(new room_planner.Event(grid, name, start, end));

            self.setEventOverlap(self.events());
        };
    };

}).call(this);