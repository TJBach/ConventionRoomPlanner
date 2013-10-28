(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    var eventCreation = {
        creatingStart: null,
        row: null
    };

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

        self.removeEvent = function(event){
            self.events.remove(event);

            self.setEventOverlap(self.events());
        };

        self.creating = ko.observable(false);
        self.markStart = function(row){
            eventCreation.creatingStart = row.date;
            eventCreation.room = self;
            eventCreation.started = true;
            self.creating(true);
            row.creating(true);
        };

        self.mark = function(row){
            row.creating(eventCreation.started);
        };

        self.cancelCreate = function(room){
            eventCreation.started = false;
            room.creating(false);
            for(var count = 0; count < self.rows().length; count++){
                self.rows()[count].creating(false);
            }
        };

        self.promptNewEvent = function(row){
            if(!eventCreation.started){
                return;
            }

            var start = eventCreation.creatingStart || row.date;
            var end = new Date(row.date.getTime() + window.room_planner.factor);
            var room = eventCreation.room || self;

            room_planner.modal.show({
                viewModel: new room_planner.AddEventViewModel(grid, start, end, self),
                template: 'add-event-template'
            }).done(function(model) {
                model.room().addEvent(model.name(), model.start(), model.end());
            }).fail(function() {
                console.log("Modal cancelled");
            }).always(function() {
                self.cancelCreate(room);
            });
        };

        self.dropEvent = function(eventContext, roomContext, evt, ui){
            var event = eventContext.$data;
            var oldRoom = eventContext.$parent;

            var top, eventTop = ui.draggable.offset().top;
            var cells = $(evt.target).children();
            var found = false;
            var current = 0;
            var cell;

            while(!found && current < cells.length){
                top = $(cells[current]).offset().top + (window.room_planner.cellHeight/2);
                found = top >= eventTop;
                current++;
            }

            oldRoom.events.remove(event);
            oldRoom.setEventOverlap(oldRoom.events());

            if(found){
                cell = ko.dataFor(cells[current-1]);
                event.rootTimeAt(cell.date);
            }

            self.events.push(event);
            self.setEventOverlap(self.events());
        };
    };

}).call(this);