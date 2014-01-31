//Example Usage: <input data-bind="datepicker: myDate, datepickerOptions: { minDate: new Date() }" />
ko.bindingHandlers.datepicker = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {};
        $(element).datetimepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($(element).datetimepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $(element).datetimepicker("destroy");
        });

    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        //handle date data coming via json from Microsoft
        if (String(value).indexOf('/Date(') == 0) {
            value = new Date(parseInt(value.replace(/\/Date\((.*?)\)\//gi, "$1")));
        }

        var current = $(element).datetimepicker("getDate");

        if (value - current !== 0) {
            $(element).datetimepicker("setDate", value);
        }
    }
};

ko.bindingHandlers.draggable = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, context) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var defaults = {
            start: function(evt, ui) {
                ui.helper.data('ko.draggable.data', context);

                if(value.koStart){
                    value.koStart(context);
                }
            },
            stop: function(evt, ui) {
                if(value.koStop){
                    value.koStop(context);
                }
            }
        };

        var options = $.extend(defaults, value);

        $(element).draggable(options);

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $(element).draggable("destroy");
        });
    }
};

ko.bindingHandlers.droppable = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, context) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var defaults = {
            drop: function(evt, ui) {
                var data = ui.helper.data('ko.draggable.data');

                if(value.kodrop){
                    value.kodrop(data, context, evt, ui);
                }
            }
        };

        var options = $.extend(defaults, value);

        $(element).droppable(options);

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $(element).droppable("destroy");
        });
    }
};

//connect items with observableArrays
ko.bindingHandlers.sortableList = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, context) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var list = value.list || valueAccessor() || [];

        var defaults = {
            update: function(event, ui) {
                //retrieve our actual data item
                var item = ko.dataFor(ui.item[0]);
                //figure out its new position
                var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);

                if (position >= list().length) {
                    position = list().length - 1;
                }
                if (position < 0) {
                    position = 0;
                }

                ui.item.remove();
                //remove the item and add it back in the right spot
                list.remove(item);
                list.splice(position, 0, item);

                if(value.kodrop){
                    value.kodrop(item, position, list, context, event, ui);
                }
            }
        };

        var options = $.extend(defaults, value);

        $(element).sortable(options);

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $(element).sortable("destroy");
        });
    }
};

ko.extenders.scrollFollow = function (target, selector) {
    target.subscribe(function (newval) {
        var el = document.querySelector(selector);

        // the scroll bar is all the way down, so we know they want to follow the text
        if (el.scrollTop == el.scrollHeight - el.clientHeight) {
            // have to push our code outside of this thread since the text hasn't updated yet
            setTimeout(function () {
                var updatedElement = document.querySelector(selector);

                updatedElement.scrollTop = updatedElement.scrollHeight - updatedElement.clientHeight;
            }, 0);
        }
    });

    return target;
};
