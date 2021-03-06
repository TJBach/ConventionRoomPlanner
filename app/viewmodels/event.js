(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Event = function(grid, name, start, end, color){
        var self = this;

        self.name = ko.observable(name);
        self.start = ko.observable(start);
        self.end = ko.observable(end);

        self.color = ko.observable(color || 'white');

        self.shift = ko.observable(0);
        self.columns = ko.observable(1);
        self.span = ko.observable(1);

        self.width = ko.dependentObservable(function(){
            return ((self.span()/self.columns())*100) + '%';
        });

        self.margin = ko.dependentObservable(function(){
            return (self.shift() * ((1/self.columns())*100)) + '%';
        });

        self.getColor = ko.computed(function() {
            return "event " + self.color();
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

            return window.room_planner.getSize(range.end - range.start) + "px"
        });

        self.position = ko.dependentObservable(function() {
            var range = getDisplayableStartAndEnd();
            var timeOffset = range.start - grid.startTime();
            return window.room_planner.getSize(timeOffset) + "px"
        });

        self.shown = ko.dependentObservable(function() {
            return self.start() < grid.endTime() && self.end() > grid.startTime();
        });

        self.rootTimeAt = function(date){
            var difference = self.end() - self.start();
            self.start(date);
            self.end(new Date(date.getTime() + difference));
        };

        self.promptForEditEvent = function(){
            var room = _.find(grid.rooms(), function(r){
                return r.events.indexOf(self) > -1;
            });

            room_planner.modal.show({
                viewModel: new room_planner.EditEventViewModel(self, room, grid),
                template: 'add-event-template'
            });
        };
    };

}).call(this);