(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.AddRoomViewModel = function(){
        var self = this;

        self.name = ko.observable();
        self.description = ko.observable();

        self.title = "Add Room";
        self.confirmText = "Add Room";

        self.add = function () {
            this.modal.close(self);
        };

        self.cancel = function () {
            this.modal.close();
        };
    };

}).call(this);