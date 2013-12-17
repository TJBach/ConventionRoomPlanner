(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.AddEventViewModel = function(grid, start, end, room){
        var self = this;

        self.name = ko.observable();
        self.start = ko.observable(start);
        self.end = ko.observable(end);

        self.room = ko.observable(room);
        self.rooms = ko.observableArray(grid.columns().slice(1));

        self.title = "Add Event";
        self.confirmText = "Add Event";

        self.colors = ko.observableArray(['red', 'green', 'blue', 'yellow', 'pink', 'white']);
        self.color = ko.observable('white');

        self.getColor = ko.computed(function() {
            return "color-preview " + self.color();
        });

        self.getRoomName = function(room){
            return room.name();
        };

        self.add = function () {
            this.modal.close(self);
        };

        self.cancel = function () {
            this.modal.close();
        };
    };

}).call(this);