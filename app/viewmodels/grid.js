(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Grid = function(startTime, endTime){
        var self = this;

        self.startTime = ko.observable(startTime);
        self.endTime = ko.observable(endTime);

        self.rows = ko.dependentObservable(function(){
            var factor = window.room_planner.factor;
            var difference = self.endTime() - self.startTime();
            var count = Math.ceil(difference / factor);
            var time, startTime = self.startTime().getTime()
            var rows = [];

            for(var i = 0; i < count; i++){
                time = startTime + i*factor;
                rows.push(new room_planner.Cell(time));
            }

            return rows;
        });

        self.columns = ko.observableArray([new room_planner.TimeBar(self)]);

        self.displayMode = function(column){
            return column.template;
        };

        self.addRoom = function(name){
            var room = new room_planner.Room(self, name);
            self.columns.push(room);
            return room;
        };

        //Computed Properties
        self.totalEvents = ko.dependentObservable(function() {
            var count, eventCount = 0;
            var rooms = self.columns();

            for(count = 1; count < rooms.length; count++){
                eventCount += rooms[count].events().length;
            }
            return eventCount;
        });

        self.planerWidth = ko.dependentObservable(function() {
            var rooms = self.columns();

            return (((rooms.length-1) * 210) + 210) + "px";
        });
    };

}).call(this);