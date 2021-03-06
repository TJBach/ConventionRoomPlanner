(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.EditEventViewModel = function(event, room, grid){
        var self = this;

        self.name = ko.observable(event.name());
        self.start = ko.observable(event.start());
        self.end = ko.observable(event.end());

        self.room = ko.observable(room);
        self.rooms = ko.observableArray(grid.columns().slice(1));

        self.title = "Edit Event";
        self.confirmText = "Edit Event";

        self.colors = ko.observableArray(['red', 'green', 'blue', 'yellow', 'pink', 'white']);
        self.color = ko.observable(event.color() || 'white');

        self.getColor = ko.computed(function() {
            return "color-preview " + self.color();
        });

        self.getRoomName = function(room){
            return room.name();
        };

        self.add = function () {
            event.name(self.name());
            event.start(self.start());
            event.end(self.end());
            event.color(self.color());

            room.events.remove(event);
            self.room().events.push(event);

            this.modal.close(self);
        };

        self.cancel = function () {
            this.modal.close();
        };
    };

}).call(this);