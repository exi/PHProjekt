/**
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 3 as published by the Free Software Foundation
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * @category  PHProjekt
 * @package   Template
 * @copyright Copyright (c) 2010 Mayflower GmbH (http://www.mayflower.de)
 * @license   LGPL v3 (See LICENSE file)
 * @link      http://www.phprojekt.com
 * @since     File available since Release 6.0
 * @version   Release: 6.1.0
 * @author    Gustavo Solt <solt@mayflower.de>
 */

dojo.provide("phpr.Timecard.GridWidget");

(function() {
    var _dayOfTheMonth = function(item) {
        return parseInt(item.startDatetime.substr(8, 2), 10);
    };

    phpr.MetadataStore.metadataFor('Timecard', 1);

    dojo.declare("phpr.Timecard._GridEntry", [dijit._Widget], {
        item: null,
        showdate: true,

        constructor: function(params) {
            dojo.mixin(this, params);
        },

        buildRendering: function() {
            this.domNode = dojo.create('tr');

            if (this.showDate === false) {
                dojo.create('td', {colspan: 2}, this.domNode);
            } else {
                dojo.create('td', {innerHTML: "Mo"}, this.domNode);
                dojo.create('td', {innerHTML: _dayOfTheMonth(this.item)}, this.domNode);
            }

            var timeNode = dojo.create("td", {innerHTML: this._time()}, this.domNode);
            var durationNode = dojo.create("td", {innerHTML: this._duration()}, this.domNode);
            var projectNode = dojo.create("td", undefined, this.domNode);
            var notesNode = dojo.create("td", {innerHTML: this.item.notes}, this.domNode);

            phpr.MetadataStore.metadataFor('Timecard', 1).then(dojo.hitch(this, this._updateProjectName, projectNode));
        },

        _time: function() {
            return this.item.startDatetime.substr(11, 5) + ' - ' + this.item.endTime.substr(0, 5);
        },

        _duration: function() {
            return Math.floor(this.item.minutes / 60).toString() + ':' + this._padTo2Chars(this.item.minutes % 60);
        },

        _padTo2Chars: function(s) {
            s = s.toString();
            if (s.length === 1) {
                s = '0' + s;
            }
            return s;
        },

        _updateProjectName: function(node, metadata) {
            var projectId = parseInt(this.item.projectId, 10);
            if (projectId === 1) {
                node.innerHTML = phpr.nls.get('Unassigned', 'Timecard');
                return;
            }

            for (var mdIndex in metadata) {
                if (metadata.hasOwnProperty(mdIndex) && metadata[mdIndex].key === "projectId") {
                    var range = metadata[mdIndex].range;
                    dojo.some(range, function(rItem) {
                        if (rItem.id !== projectId) {
                            return false;
                        }

                        node.innerHTML = rItem.name;
                        return true;
                    });
                    return;
                }
            }
        }
    });

    dojo.declare("phpr.Timecard._DummyGridEntry", [dijit._Widget, dijit._Templated], {
        templateString: [
            '<tr>',
            '  <td dojoAttachPoint="dotWeek"/>',
            '  <td dojoAttachPoint="dotMonth"/>',
            '  <td/>',
            '  <td/>',
            '  <td/>',
            '  <td/>',
            '</tr>'
        ].join("\n"),

        dayOfTheWeek: '',
        dayOfTheMonth: '',

        constructor: function(params) {
            dojo.mixin(this, params);
        },

        buildRendering: function() {
            this.inherited(arguments);
            this.dotWeek.innerHTML = this.dayOfTheWeek;
            this.dotMonth.innerHTML = this.dayOfTheMonth;
        }
    });

    dojo.declare("phpr.Timecard.GridWidget", [dijit._Widget, dijit._Templated], {
        templateString: ['',
            '<table style="border: solid black 1px; white-space: nowrap; important! margin: 5px;">',
            '  <thead>',
            '    <tr>',
            '        <th colspan="2">Date</th>',
            '        <th>Time</th>',
            '        <th>Duration</th>',
            '        <th>Project</th>',
            '        <th>Notes</th>',
            '    </tr>',
            '  </thead>',
            '  <tbody dojoAttachpoint="tbody"></tbody>',
            '</table>'
        ].join("\n"),

        store: null,

        _supportingWidgets: [],

        uninitialize: function() {
            dojo.forEach(this._supportingWidgets, function(widget) {
                widget.destroyRecursive();
            });
        },

        buildRendering: function() {
            this.inherited(arguments);

            var startDate = new Date('2012-10-01');
            var endDate = new Date('2012-10-31');

            var foo = this.store.query({
                startDatetime: dojo.toJson({year: 2012, month: 3})
            }, {
                sort: [{attribute: "start_datetime", descending: false}]
            }).then(dojo.hitch(this, function(items) {
                var itemsByDay = {};
                dojo.forEach(items, function(item) {
                    var itemStart = phpr.date.isoDatetimeTojsDate(item.startDatetime).toDateString();
                    itemsByDay[itemStart] = itemsByDay[itemStart] || [];
                    itemsByDay[itemStart].push(item);
                });

                this._forEachDayBetween(new Date('2012-10-01'), new Date('2012-11-01'), dojo.hitch(this, function(day) {
                    var dateString = day.toDateString();
                    if (itemsByDay[dateString]) {
                        this._addRow({item: itemsByDay[dateString].shift(), showDate: true});
                        dojo.forEach(itemsByDay[dateString], dojo.hitch(this, function(item) {
                            this._addRow({item: item, showDate: false});
                        }));
                    } else {
                        this._addDummyRow({dayOfTheWeek: 'Mo', dayOfTheMonth: day.getDate().toString()});
                    }
                }));
            }));
        },

        _addRow: function(params) {
            var placeholder = dojo.create('tr', null, this.tbody);
            this._supportingWidgets.push(
                new phpr.Timecard._GridEntry({
                    item: params.item,
                    showDate: params.showDate
                }, placeholder)
            );
        },

        _addDummyRow: function(params) {
            var placeholder = dojo.create('tr', null, this.tbody);
            this._supportingWidgets.push(
                new phpr.Timecard._DummyGridEntry(params, placeholder)
            );
        },

        _getDatePart: function(isoDatetime) {
            return isoDatetime.substr(0, 10);
        },

        _forEachDayBetween: function(from, to, fun) {
            for (; (from.getFullYear() < to.getFullYear()) ||
                        (from.getMonth() < to.getMonth()) ||
                        (from.getDate() < to.getDate());
                    from = dojo.date.add(from, 'day', 1)) {
                fun(from);
            }
        }
    });
})();
