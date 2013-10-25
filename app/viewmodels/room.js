(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Room = function(grid, name){
        var self = this;

        self.name = ko.observable(name);
        self.description = ko.observable();
        self.events = ko.observableArray();
        self.rows = grid.rows;
        self.template = "room-template";

        self.visibleEvents = ko.dependentObservable(function(){
            return ko.utils.arrayFilter(self.events(), function(event) {
                return event.shown();
            });
        });

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

        self.promptNewEvent = function(row){
            var start = row.date;
            var end = new Date(row.date.getTime() + window.room_planner.factor);

            room_planner.modal.show({
                viewModel: new room_planner.AddEventViewModel(start, end),
                template: 'add-event-template'
            }).done(function(model) {
                self.addEvent(model.name(), model.start(), model.end());
            }).fail(function() {
                console.log("Modal cancelled");
            });
        };

        self.remove = function(){
            grid.removeRoom(self);
        }

        self.removeEvent = function(event){
            self.events.remove(event);

            self.setEventOverlap(self.events());
        };
    };

    room_planner.AddRoomViewModel = function(){
        var self = this;

        self.name = ko.observable(name);
        self.description = ko.observable();

        self.add = function () {
            this.modal.close(self);
        };

        self.cancel = function () {
            this.modal.close();
        };
    };

}).call(this);