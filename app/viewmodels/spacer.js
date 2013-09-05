(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Spacer = function(start, end){
        var self = this;

        self.start = start;
        self.end = end;
        self.registared = false;

        self.getHeight = function(){
            return ((self.end - self.start) / 1800000 * 50);
        }

        self.height = ko.dependentObservable(function() {
            return self.getHeight() + "px";
        });

        self.blocks = ko.dependentObservable(function(){
            var timespan = self.end - self.start;
            var timeblocks = new Array(Math.floor(timespan/1800000));

            return timeblocks;
        });
    };
}).call(this);