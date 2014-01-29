(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Grid = function(conventionId, startTime, endTime){
        var self = this;

        self.con_id = ko.observable(conventionId);
        self.chat = new room_planner.ChatClient(conventionId);

        self.startTime = ko.observable(startTime);
        self.endTime = ko.observable(endTime);

        self.rows = ko.dependentObservable(function(){
            var start = self.startTime() || new Date();
            var end = self.endTime() || new Date();
            var factor = window.room_planner.factor;
            var difference = end - start;
            var count = Math.ceil(difference / factor);
            var time, startTime = start.getTime();
            var rows = [];

            for(var i = 0; i < count; i++){
                time = startTime + i*factor;
                rows.push(new room_planner.Cell(time));
            }

            return rows;
        });

        self.columns = ko.observableArray([new room_planner.TimeBar(self)]);

        self.rooms = ko.dependentObservable(function(){
            return self.columns().slice(1);
        });

        self.displayMode = function(column){
            return column.template;
        };

        self.addRoom = function(name){
            var room = new room_planner.Room(self, name);
            self.columns.push(room);
            return room;
        };

        self.removeRoom = function(room){
            self.columns.remove(room);
        };

        //Computed Properties
        self.totalEvents = ko.dependentObservable(function() {
            var count, eventCount = 0;
            var rooms = self.columns();

            for(count = 1; count < rooms.length; count++){
                eventCount += rooms[count].events().length;
            }
            return eventCount;
        });

        self.planerWidth = ko.dependentObservable(function() {
            var rooms = self.columns();

            return (((rooms.length-1) * 210) + 210) + "px";
        });

        //events
        self.promptForNewRoom = function(){
            room_planner.modal.show({
                viewModel: new room_planner.AddRoomViewModel(),
                template: 'add-room-template'
            }).done(function(model) {
                self.addRoom(model.name());
            }).fail(function() {
                console.log("Modal cancelled");
            });
        };

        self.promptForNewEvent = function(){
            if(self.columns().length < 2){
                return;
            }

            var start = self.startTime();
            var end = new Date(start.getTime() + window.room_planner.factor);
            var room = self.columns()[1];

            room_planner.modal.show({
                viewModel: new room_planner.AddEventViewModel(self, start, end, room),
                template: 'add-event-template'
            }).done(function(model) {
                model.room().addEvent(model.name(), model.start(), model.end());
            });
        };
    };

}).call(this);