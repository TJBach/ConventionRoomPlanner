(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Room = function(planner, name){
        var self = this;

        self.name = ko.observable(name);
        self.events = ko.observableArray();

        self.addEvent = function(name, start, end){
            self.events.push(new room_planner.Event(name, start, end));
        };

        self.displayMode = function(event){
            return event.registared ? "event-template" : "empty-space-template";
        };

        self.eventColumn = ko.dependentObservable(function(){
            var start = planner.startDate();
            var end = planner.endDate();
            var current = start;
            var column = [];

            var events = self.events().slice().sort(function(left, right){
                return left.start() < right.start();
            });
            var event;

            while(current < end){
                event = events.pop();

                if(event){
                    if(event.start() > current){
                        column.push(new room_planner.Spacer(current, event.start()));
                    }

                    column.push(event);

                    current = event.end();
                } else {
                    column.push(new room_planner.Spacer(current, end));

                    current = end;
                }
            }

            return column;
        });
    };
}).call(this);