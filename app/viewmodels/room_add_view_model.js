(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

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