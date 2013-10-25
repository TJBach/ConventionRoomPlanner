(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Event = function(grid, name, start, end){
        var self = this;

        self.name = ko.observable(name);
        self.start = ko.observable(start);
        self.end = ko.observable(end);
        self.overlap = ko.observable(1);
        self.shift = ko.observable(0);

        self.width = ko.dependentObservable(function(){
            return ((1/self.overlap())*100) + '%';
        });

        self.margin = ko.dependentObservable(function(){
            return (self.shift() * ((1/self.overlap())*100)) + '%';
        });

        var getDisplayableStartAndEnd = function(){
            var start = self.start();
            var end = self.end();

            if(start < grid.startTime()){
                start =  grid.startTime();
            }
            if(end > grid.endTime()){
                end =  grid.endTime();
            }

            return { start: start, end: end };
        };

        self.height = ko.dependentObservable(function() {
            var range = getDisplayableStartAndEnd();

            return ((range.end - range.start) / window.room_planner.factor * window.room_planner.cellHeight) + "px"
        });

        self.position = ko.dependentObservable(function() {
            var range = getDisplayableStartAndEnd();
            var timeOffset = range.start - grid.startTime();
            return (timeOffset / window.room_planner.factor * window.room_planner.cellHeight) + "px"
        });

        self.shown = ko.dependentObservable(function() {
            return self.start() < grid.endTime() && self.end() > grid.startTime();
        });

        self.overlaps = function(otherEvent){
            var selfStart = this.start(), selfEnd = this.end();
            var otherStart = otherEvent.start(), otherEnd = otherEvent.end();

            return (selfStart <= otherStart && selfEnd >= otherStart) ||
                (selfStart <= otherEnd && selfEnd >= otherEnd) ||
                (selfStart >= otherStart && selfEnd <= otherEnd);
        }

        self.setOverlaps = function(otherEvents, skip){
            var z, against;

            for(z = skip; z < otherEvents.length; z++){
                against = otherEvents[z];

                if(this.overlaps(against) || against.overlaps(this)){
                    this.overlap(this.overlap() + 1);
                    against.overlap(against.overlap() + 1);
                    against.shift(against.shift() + 1);
                }
            }
        }
    };

    room_planner.AddEventViewModel = function(start, end){
        var self = this;

        self.name = ko.observable();
        self.start = ko.observable(start);
        self.end = ko.observable(end);

        self.add = function () {
            this.modal.close(self);
        };

        self.cancel = function () {
            this.modal.close();
        };
    };

}).call(this);