(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.RoomPlanner = function(){
        var self = this;

        //Set properties
        self.startDate = ko.observable();
        self.endDate = ko.observable();

        self.rooms = ko.observableArray();

        //Time on the side
        self.timebarHeight = ko.dependentObservable(function() {
            return ((self.endDate() - self.startDate()) / 1800000 * 50) + "px"
        });

        self.timeList = ko.dependentObservable(function(){
            var start = self.startDate();
            var end = self.endDate();
            var timespan = end - start;
            var timeblocks = [];
            var date;

            while(timespan > 0){
                date = new Date(end.getTime() - timespan);

                timeblocks.push(date.getHours() == 0 && date.getMinutes() == 0
                    ? date.toDateString()
                    : date.toLocaleTimeString());

                timespan -= 1800000;
            }

            return timeblocks;
        });

        //Computed Properties
        self.totalEvents = ko.dependentObservable(function() {
            var count, eventCount = 0;
            var rooms = self.rooms();

            for(count = 0; count < rooms.length; count++){
                eventCount += rooms[count].events().length;
            }
            return eventCount;
        });

        self.planerWidth = ko.dependentObservable(function() {
            var rooms = self.rooms();

            return ((rooms.length * 210) + 210) + "px";
        });
    };
}).call(this);