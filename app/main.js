var room = function(planner, name){
    var self = this;

    self.name = ko.observable(name);
    self.events = ko.observableArray();

    self.addEvent = function(name, start, end){
        self.events.push(new event(name, start, end));
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
                    column.push(new spacer(current, event.start()));
                }

                column.push(event);

                current = event.end();
            } else {
                column.push(new spacer(current, end));

                current = end;
            }
        }

        return column;
    });
};

var event = function(name, start, end){
    var self = this;

    self.name = ko.observable(name);
    self.start = ko.observable(start);
    self.end = ko.observable(end);

    self.registared = true;

    self.height = ko.dependentObservable(function() {
        return ((self.end() - self.start()) / 1800000 * 50) + "px"
    });
};

var spacer = function(start, end){
    var self = this;

    self.start = start;
    self.end = end;
    self.registared = false;

    self.getHeight = function(){
        return ((self.end - self.start) / 1800000 * 50);
    }

    self.height = ko.dependentObservable(function() {
        return self.getHeight() + "px";
    });

    self.blocks = ko.dependentObservable(function(){
        var timespan = self.end - self.start;
        var timeblocks = new Array(Math.floor(timespan/1800000));

        return timeblocks;
    });
};

var plannerViewModel = function(){
    var self = this;

    //Bootstrap some test data
    self.startDate = ko.observable(new Date(2013, 9, 22, 7));
    self.endDate = ko.observable(new Date(2013, 9, 23, 12));

    self.rooms = ko.observableArray([
        new room(self, "Room 123"),
        new room(self, "Room 124"),
        new room(self, "Room 223"),
        new room(self, "Room 224"),
        new room(self, "Ball Room")
    ]);
    var rooms = self.rooms();

    rooms[0].addEvent("Test 1", new Date(2013, 9, 22, 8, 30), new Date(2013, 9, 22, 10, 30));
    rooms[1].addEvent("Test 2", new Date(2013, 9, 22, 8, 0), new Date(2013, 9, 22, 9, 0));
    rooms[1].addEvent("Test 3", new Date(2013, 9, 22, 9, 30), new Date(2013, 9, 22, 12, 0));

    //Time on the side
    self.timebarHeight = ko.dependentObservable(function() {
        return ((self.endDate() - self.startDate()) / 1800000 * 50) + "px"
    });

    self.timeList = ko.dependentObservable(function(){
        var start = self.startDate();
        var end = self.endDate();
        var timespan = end - start;
        var timeblocks = [];
        var date;

        while(timespan > 0){
            date = new Date(end.getTime() - timespan);

            timeblocks.push(date.getHours() == 0 && date.getMinutes() == 0
                ? date.toDateString()
                : date.toLocaleTimeString());

            timespan -= 1800000;
        }

        return timeblocks;
    });

    //Computed Properties
    self.totalEvents = ko.dependentObservable(function() {
        var count, eventCount = 0;
        var rooms = self.rooms();

        for(count = 0; count < rooms.length; count++){
            eventCount += rooms[count].events().length;
        }
        return eventCount;
    });

    self.planerWidth = ko.dependentObservable(function() {
        var rooms = self.rooms();

        return ((rooms.length * 210) + 210) + "px";
    });
};

ko.applyBindings(new plannerViewModel());