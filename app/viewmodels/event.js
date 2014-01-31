(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    var socket = room_planner.getSocket();

    room_planner.Event = function(grid, room, event){
        var self = this;

        self._id = ko.observable(event._id);
        self.conId = ko.observable(grid._id());
        self.roomId = ko.observable(room._id());

        self.name = ko.observable(event.name);

        self.start = ko.observable(_.isString(event.start) ? new Date(event.start) : event.start);
        self.end = ko.observable(_.isString(event.end) ? new Date(event.end) : event.end);

        self.color = ko.observable(event.color || 'white');

        self.shift = ko.observable(0);
        self.columns = ko.observable(1);
        self.span = ko.observable(1);

        self.reserve = ko.observable(false);

        self.width = ko.dependentObservable(function(){
            return ((self.span()/self.columns())*100) + '%';
        });

        self.margin = ko.dependentObservable(function(){
            return (self.shift() * ((1/self.columns())*100)) + '%';
        });

        self.getColor = ko.computed(function() {
            return "event " + (self.reserve() ? "black" : self.color());
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

        self.startDrag = function(ctx){
            socket.emit('event:reserve', {
                _id : self._id(),
                conId : self.conId(),
                roomId : self.roomId()
            });
        };

        self.stopDrag = function(ctx){
            socket.emit('event:release', {
                _id : self._id(),
                conId : self.conId(),
                roomId : self.roomId()
            });
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