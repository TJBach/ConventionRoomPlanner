(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    var socket = room_planner.getSocket();

    room_planner.EditRoomViewModel = function(room){
        var self = this;

        self.name = ko.observable(room.name());
        self.description = ko.observable(room.description());

        self.title = "Edit Room";
        self.confirmText = "Edit Room";

        self.add = function () {
            room.name(self.name());
            room.description(self.description());

            socket.emit('room:update', ko.toJS(room));

            this.modal.close(self);
        };

        self.cancel = function () {
            this.modal.close();
        };
    };

}).call(this);