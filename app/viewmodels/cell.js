(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Cell = function(time){
        var self = this;
        self.date = new Date(time);

        self.dateText = self.date.getMinutes() == 0
            ? (self.date.getHours() == 0 ? self.date.toDateString() : self.date.toLocaleTimeString() )
            : "";

        self.creating = ko.observable(false);
    };

}).call(this);