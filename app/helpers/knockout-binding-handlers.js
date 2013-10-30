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
