var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Main = imports.ui.main;
var PopupMenu = imports.ui.popupMenu;
var PanelMenu = imports.ui.panelMenu;
var _a = imports.gi, Gio = _a.Gio, St = _a.St;
var GObject = imports.gi.GObject;
var Mainloop = imports.mainloop;
var ExtensionUtils = imports.misc.extensionUtils;
var Me = ExtensionUtils.getCurrentExtension();
var ActionBar = Me.imports.actionBar;
var ConfirmDialog = Me.imports.confirmDialog;
var ScrollMenu = Me.imports.scrollMenu;
var SearchBox = Me.imports.searchBox;
var Utils = Me.imports.utils;
var gnomeClipboardMenu = /** @class */ (function (_super) {
    __extends(gnomeClipboardMenu, _super);
    function gnomeClipboardMenu() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    gnomeClipboardMenu.prototype._init = function () {
        _super.prototype._init.call(this, 0.0, _("Clipboard"));
        this.clipboardIcon = new St.Icon({
            icon_name: 'edit-copy-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.add_actor(this.clipboardIcon);
        this.setupDatabase();
        this.setupMenu();
        //   this.setupWatch();
        // Clear search when re-open the menu and set focus on search box
        //   this.menu.connect('open-state-changed', function (self, open) {
        //     if (open) {
        //       let that = this;
        //       let t = Mainloop.timeout_add(50, function () {
        //         that.search_box.setText('');
        //         global.stage.set_key_focus(that.search_box.search_entry);
        //         Mainloop.source_remove(t);
        //       });
        //     }
        //   }.bind(this));
        log("gnome-clipboard initialized successfully");
    };
    gnomeClipboardMenu.prototype.setupDatabase = function () {
    };
    gnomeClipboardMenu.prototype.setupMenu = function () {
        // this.search_box = new SearchBox.SearchBox();
        // this.menu.addMenuItem(this.search_box);
        // let separator1 = new PopupMenu.PopupSeparatorMenuItem();
        // this.menu.addMenuItem(separator1);
        this.main_menu = new ScrollMenu.ScrollMenu();
        this.menu.addMenuItem(this.main_menu);
        // let separator2 = new PopupMenu.PopupSeparatorMenuItem();
        // this.menu.addMenuItem(separator2);
        // // Toolbar
        // this.action_bar = new ActionBar.ActionBar(this);
        // this.menu.addMenuItem(this.action_bar);
        // this.search_box.onTextChanged(this.onSearchItemChanged.bind(this));
    };
    // onSearchItemChanged() {
    //   let query = this.search_box.getText().toLowerCase();
    //   if (query === '') {
    //     this.trash_menu.getAllItems().forEach(function (item) {
    //       item.actor.visible = true;
    //     });
    //   }
    //   else {
    //     this.trash_menu.getAllItems().forEach(function (item) {
    //       let text = item.file_name.toLowerCase();
    //       let matched = text.indexOf(query) >= 0;
    //       item.actor.visible = matched
    //     });
    //   }
    // }
    gnomeClipboardMenu.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return gnomeClipboardMenu;
}(PanelMenu.Button));
function init() {
    ExtensionUtils.initTranslations();
}
var _gnomeClipboard = null;
function enable() {
    _gnomeClipboard = new gnomeClipboardMenu;
    Main.panel.addToStatusArea('gnome_clipboard_button', _gnomeClipboard);
}
function disable() {
    _gnomeClipboard.destroy();
}
var cbItem = /** @class */ (function () {
    function cbItem() {
    }
    return cbItem;
}());
var cbHistory = /** @class */ (function () {
    function cbHistory() {
    }
    cbHistory.prototype.load = function (path) {
        var file = Gio.file_new_for_path(path);
    };
    return cbHistory;
}());
