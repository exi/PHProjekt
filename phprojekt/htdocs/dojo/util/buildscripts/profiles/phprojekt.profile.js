var profile = {
    version: "1.0.0",
    bin: "node",
    stripConsole: "normal",
    optimize: "closure",
    layerOptimize: "closure",
    cssOptimize: "comments",
    action: "release",
    releaseDir: "../../../release/dojo",
    selectorEngine: "lite",
    layers: {
        "dojo/setup": {
            //extra layer for the setup system
            boot: true,
            include: [
                "dojo/main",
                "dijit/dijit",
                "dijit/layout/BorderContainer",
                "dijit/layout/ContentPane",
                "dijit/Toolbar",
                "dijit/form/Form",
                "dijit/form/Button",
                "dijit/form/CheckBox",
                "dijit/form/TextBox",
                "dijit/TooltipDialog",
                "dijit/form/FilteringSelect"
            ]
        },
        "dojo/login": {
            //extra layer for the setup system
            boot: true,
            include: [
                "dojo/main",
                "dojo/parser",
                "dijit/layout/BorderContainer",
                "dijit/layout/ContentPane",
                "dijit/Toolbar",
                "dijit/form/Form",
                "dijit/form/TextBox",
                "dijit/form/CheckBox"
            ]
        },
        "dojo/phprojekt": {
            //extra layer for the phprojekt system
            boot: true,
            include: [
                "dojo/main",
                "dojo/i18n",
                "dijit/TooltipDialog",
                "dojo/fx/Toggler",
                "dijit/form/RadioButton",
                "dojo/dnd/Target",
                "dijit/CheckedMenuItem",
                "dijit/Dialog",
                "dijit/Menu",
                "dijit/MenuItem",
                "dijit/MenuSeparator",
                "dijit/PopupMenuItem",
                "dijit/TitlePane",
                "dijit/Tree",
                "dijit/_Templated",
                "dijit/_Widget",
                "dijit/_editor/plugins/FontChoice",
                "dijit/_editor/plugins/LinkDialog",
                "dijit/_editor/plugins/TextColor",
                "dijit/dijit",
                "dijit/form/CheckBox",
                "dijit/form/DateTextBox",
                "dijit/form/FilteringSelect",
                "dijit/form/Form",
                "dijit/form/Select",
                "dijit/form/HorizontalRule",
                "dijit/form/HorizontalRuleLabels",
                "dijit/form/HorizontalSlider",
                "dijit/form/SimpleTextarea",
                "dijit/form/Textarea",
                "dijit/layout/BorderContainer",
                "dijit/layout/StackContainer",
                "dijit/layout/TabContainer",
                "dijit/layout/TabController",
                "dijit/layout/_LayoutWidget",
                "dijit/tree/ForestStoreModel",
                "dojo/DeferredList",
                "dojo/NodeList-traverse",
                "dojo/cookie",
                "dojo/data/ItemFileWriteStore",
                "dojo/dnd/AutoSource",
                "dojo/dnd/Moveable",
                "dojo/dnd/Source",
                "dojo/hash",
                "dojox/data/QueryReadStore",
                "dojox/dtl/Context",
                "dojox/dtl/Inline",
                "dojox/dtl/tag/logic",
                "dojox/form/CheckedMultiSelect",
                "dojox/form/RangeSlider",
                "dojox/form/Rating",
                "dojox/grid/DataGrid",
                "dojox/grid/DataSelection",
                "dojox/grid/Selection",
                "dojox/grid/_View",
                "dojox/grid/cells/dijit",
                "dojox/layout/ExpandoPane",
                "dojox/layout/FloatingPane",
                "dojox/layout/ContentPane",
                "dojox/layout/ResizeHandle",
                "dojox/widget/Toaster"
            ]
        }
    },

    packages: [
        { name: "dojo", location: "../../../dojo" },
        { name: "dijit", location: "../../../dijit" },
        { name: "dojox", location: "../../../dojox" }
    ]
};
