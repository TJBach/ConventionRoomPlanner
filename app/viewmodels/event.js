(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Event = function(name, start, end){
        var self = this;

        self.name = ko.observable(name);
        self.start = ko.observable(start);
        self.end = ko.observable(end);

        self.registared = true;

        self.height = ko.dependentObservable(function() {
            return ((self.end() - self.start()) / 1800000 * 50) + "px"
        });
    };

}).call(this);