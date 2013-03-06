define([
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/dom-attr',
    'dojo/date/locale',
    'dojo/promise/all',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'phpr/Api',
    'phpr/Timehelper',
    'phpr/models/Timecard',
    'dojo/text!phpr/template/statistics/WorktimeMonthGraph.html',
    'd3/d3.v3.js'
], function(
    lang,
    declare,
    domAttr,
    locale,
    all,
    Widget,
    Templated,
    api,
    timehelper,
    timecardModel,
    templateString
) {

    var maxMinutes = 60 * 15,
        barPadding = 2;

    return declare([Widget, Templated], {
        templateString: templateString,
        baseClass: 'thisMonthDiagram',

        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth(),

        buildRendering: function() {
            this.inherited(arguments);

            this._updateLabels();

            timecardModel.getMonthList().then(lang.hitch(this, function(data) {
                this._renderDays(data.days);
            }));

            timecardModel.getMonthStatistics().then(lang.hitch(this, function(result) {
                var overtime = result.booked.minutesBooked - result.towork.minutesToWork;
                this.overtimeLabel.innerHTML = timehelper.minutesToHMString(overtime) + " Overtime";
            }), function(err) {
                api.defaultErrorHandler(err);
            });
        },

        _updateLabels: function() {
            var first = new Date(this.year, this.month, 1, 0, 0, 0),
                last = new Date(this.year, this.month + 1, 0, 0, 0, 0);
            this.firstDayLabel.innerHTML = locale.format(first, {selector: 'date', datePattern: 'EEE d'});
            this.lastDayLabel.innerHTML = locale.format(last, {selector: 'date', datePattern: 'EEE d'});
        },

        _days: null,

        _renderDays: function(days) {
            this.days = days;
            var minutesToWork = 450,
                heightPerMinute = this._heightForTimebars() / maxMinutes,
                heightForMinutesToWork = this._heightForTimebars() - heightPerMinute * minutesToWork;

            var svg = d3.select(this.bookedTimePerDayGraph);
            var svgData = svg.selectAll().data(days);

            svgData.enter()
                .append("svg:rect")
                    .attr("fill", function(d) {
                        return d.sumInMinutes < minutesToWork ? "#b5b5b5" : "white";
                    })
                    .attr("x", lang.hitch(this, function(d, i) {
                        return i * (barPadding + this._barWidth());
                    }))
                    .attr("y", lang.hitch(this, function(d) {
                        return Math.min(
                            this._heightForTimebars() - 2,
                            this._heightForTimebars() - heightPerMinute * d.sumInMinutes
                        );
                    }))
                    .attr("width", this._barWidth())
                    .attr("height", function(d) {
                        return Math.max(2, heightPerMinute * d.sumInMinutes);
                    })
                    .append("svg:title")
                        .text(function(d) {
                            var date = locale.format(timehelper.dateToJsDate(d.date), {selector: 'date'});
                            return date + ' (' + d.sumInHours + ')';
                        });

            var greenBarY = lang.hitch(this, function(d, i) {
                var date = timehelper.dateToJsDate(d.date);
                if (locale.isWeekend(date)) {
                    return this._heightForTimebars();
                }
                return heightForMinutesToWork;
            });

            // horizontal lines
            svgData.enter()
                .append("svg:line")
                    .attr("x1", lang.hitch(this, function(d, i) {
                        return i * (barPadding + this._barWidth());
                    }))
                    .attr("x2", lang.hitch(this, function(d, i) {
                        return (i + 1) * (barPadding + this._barWidth());
                    }))
                    .attr("y1", greenBarY)
                    .attr("y2", greenBarY)
                    .attr("stroke", "#6aa700");

            // vertical lines
            svgData.enter()
                .append("svg:line")
                    .attr("x1", lang.hitch(this, function(d, i) {
                        return i * (barPadding + this._barWidth());
                    }))
                    .attr("x2", lang.hitch(this, function(d, i) {
                        return (i) * (barPadding + this._barWidth());
                    }))
                    .attr("y1", function(d, i) {
                        if (i === 0) {
                            return greenBarY(d, i);
                        }
                        return greenBarY(days[i - 1], i - 1);
                    })
                    .attr("y2", greenBarY)
                    .attr("stroke", "#6aa700");

            if (this._onCurrentMonth(this.year, this.month)) {
                var currentDate = (new Date()).getDate();
                svg.append("rect")
                    .attr("x", this._todayX() - 1)
                    .attr("width", 2)
                    .attr("y", 0)
                    .attr("height", this._heightForTimebars())
                    .attr("fill", "#0d639b");
            }

            //update.exit().remove();
            //svg.exit().remove();
        },

        // These functions assume _days is set
        _heightForTimebars: function() {
            return domAttr.get(this.bookedTimePerDayGraph, "height");
        },

        _displayWidth: function() {
            return domAttr.get(this.bookedTimePerDayGraph, "width") - 40;
        },

        _barWidth: function() {
            return (this._displayWidth() / this.days.length) - barPadding;
        },

        _onCurrentMonth: function(year, month) {
            var currentYear = (new Date()).getFullYear(),
                currentMonth = (new Date()).getMonth();
            return (year == currentYear && month == currentMonth);
        },

        _onPreviousMonth: function(year, month) {
            var currentYear = (new Date()).getFullYear(),
                currentMonth = (new Date()).getMonth();
            return (year < currentYear || month < currentMonth);
        },

        _todayX: function() {
            return (new Date()).getDate() * (this._barWidth() + barPadding) - (barPadding / 2);
        },

        _updateUpperLeftRect: function() {
            if (this._onCurrentMonth(this.year, this.month)) {
                domAttr.set(this.upperLeftRect, 'height', heightForMinutesToWork);
                domAttr.set(this.upperLeftRect, 'width', this._todayX());
            } else if (this._onPreviousMonth(this.year, this.month)) {
                domAttr.set(this.upperLeftRect, 'height', heightForMinutesToWork);
                domAttr.set(this.upperLeftRect, 'width', this._displayWidth());
            } else {
                domAttr.set(this.upperLeftRect, 'width', 0);
            }
        }
    });
});

