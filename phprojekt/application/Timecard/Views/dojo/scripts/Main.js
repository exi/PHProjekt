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

dojo.provide("phpr.Timecard.Main");

dojo.require("dijit.ColorPalette");
//dojo.require("phpr.Timecard.GridWidget");

dojo.declare("phpr.Timecard.Main", phpr.Default.Main, {
    constructor: function() {
        this.module = "Timecard";
        this.loadFunctions(this.module);

        this.formWidget = phpr.Timecard.Form;
    },

    renderTemplate: function() {
        // Summary:
        //   Custom renderTemplate for statistic
        var def = phpr.MetadataStore.metadataFor('Timecard', 1);
        def.then(dojo.hitch(this, this._renderTemplate));
    },

    _renderTemplate: function(metadata) {
        var view = phpr.viewManager.useDefaultView({blank: true}).clear();

        var content = new phpr.Default.System.TemplateWrapper({
            templateName: "phpr.Timecard.template.mainContent.html"
        });

        new phpr.Timecard.GridWidget({
            store: new dojo.store.JsonRest({target: 'index.php/Timecard/Timecard'}),
            metadata: metadata
        }, content.grid);

        view.centerMainContent.set('content', content);
    },

    setWidgets: function() {}
});
