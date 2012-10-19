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

    var _weekDay = function(date) {
        return dojo.date.locale.format(date, { datePattern: 'EEE', selector: 'date' });
    };

    phpr.MetadataStore.metadataFor('Timecard', 1);

    dojo.declare("phpr.Timecard._GridEntry", [dijit._Widget], {
        item: null,
        showDate: true,
        dayNodes: [],

        constructor: function(params) {
            this.dayNodes = [];
            dojo.mixin(this, params);
        },

        buildRendering: function() {
            this.domNode = dojo.create('tr');
            dojo.addClass(this.domNode, 'dojoxGridRow');

            if (this.showDate === false) {
                this.dayNodes.push(dojo.create('td', {colspan: 2}, this.domNode));
            } else {
                this.dayNodes.push(dojo.create('td', null, this.domNode));
                this.dayNodes.push(dojo.create('td', null, this.domNode));
            }

            this.timeNode = dojo.create("td", null, this.domNode);
            this.durationNode = dojo.create("td", null, this.domNode);
            this.projectNode = dojo.create("td", null, this.domNode);
            this.notesNode = dojo.create("td", null, this.domNode);

            dojo.forEach(
                [this.timeNode, this.durationNode, this.projectNode, this.notesNode].concat(this.dayNodes),
                function(node) {
                    dojo.addClass(node, 'dojoxGridCell');
                }
            );

            this.connect(this.domNode, "onclick", "_onClick");
            this.connect(this.domNode, "onmouseover", "_onMouseOver");
            this.connect(this.domNode, "onmouseout", "_onMouseOut");
        },

        _onClick: function() {
            phpr.pageManager.modifyCurrentState({ id: this.item.id });
        },

        _onMouseOver: function() {
            dojo.addClass(this.domNode, 'dojoxGridRowOver');
        },

        _onMouseOut: function() {
            dojo.removeClass(this.domNode, 'dojoxGridRowOver');
        }
    });

    dojo.declare("phpr.Timecard.GridEntry", phpr.Timecard._GridEntry, {
        dayNodes: [],
        buildRendering: function() {
            this.inherited(arguments);

            if (this.showDate === true) {
                dojo.html.set(this.dayNodes[0], '' + _weekDay(phpr.date.isoDatetimeTojsDate(this.item.startDatetime)));
                dojo.html.set(this.dayNodes[1], '' + _dayOfTheMonth(this.item));
            }

            dojo.html.set(this.timeNode, '' + this._time());
            dojo.html.set(this.durationNode, '' + this._duration());
            dojo.html.set(this.notesNode, '' + this.item.notes);

            phpr.MetadataStore.metadataFor('Timecard', 1).then(dojo.hitch(this, this._updateProjectName));
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

        _updateProjectName: function(metadata) {
            var projectId = parseInt(this.item.projectId, 10);
            if (projectId === 1) {
                dojo.html.set(this.projectNode, '' + phpr.nls.get('Unassigned', 'Timecard'));
                return;
            }

            for (var mdIndex in metadata) {
                if (metadata.hasOwnProperty(mdIndex) && metadata[mdIndex].key === "projectId") {
                    var range = metadata[mdIndex].range;
                    dojo.some(range, function(rItem) {
                        if (rItem.id !== projectId) {
                            return false;
                        }

                        dojo.html.set(this.projectNode, '' + rItem.name);
                        return true;
                    });
                    return;
                }
            }
        }

    });

    dojo.declare("phpr.Timecard.DummyGridEntry", phpr.Timecard._GridEntry, {
        dayOfTheWeek: '',
        dayOfTheMonth: '',

        constructor: function(params) {
            dojo.mixin(this, params);
            this.item = this.item || {};
        },

        _time: function() {
            return '';
        },

        _duration: function() {
            return '';
        },

        buildRendering: function() {
            this.inherited(arguments);
            if (this.showDate === true) {
                dojo.html.set(this.dayNodes[0], this.dayOfTheWeek);
                dojo.html.set(this.dayNodes[1], this.dayOfTheMonth);
            }
        }
    });

    dojo.declare("phpr.Timecard.GridWidget", [dijit._Widget, dijit._Templated], {
        templateString: ['',
            '<table class="timecardGrid">',
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
                        this._addDummyRow({
                            dayOfTheWeek: _weekDay(day),
                            dayOfTheMonth: day.getDate().toString()
                        });
                    }
                }));
            }));
        },

        _addRow: function(params) {
            var placeholder = dojo.create('tr', null, this.tbody);
            this._supportingWidgets.push(
                new phpr.Timecard.GridEntry({
                    item: params.item,
                    showDate: params.showDate
                }, placeholder)
            );
        },

        _addDummyRow: function(params) {
            var placeholder = dojo.create('tr', null, this.tbody);
            this._supportingWidgets.push(
                new phpr.Timecard.DummyGridEntry(params, placeholder)
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
