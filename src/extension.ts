const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const { Gio, GLib, Pango, St, GObject } = imports.gi
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
//const ActionBar = Me.imports.actionBar;
//const ConfirmDialog = Me.imports.confirmDialog;
//const ScrollMenu = Me.imports.scrollMenu;
//const SearchBox = Me.imports.searchBox;
//const Utils = Me.imports.utils;


var gnomeClipboardMenu = GObject.registerClass(
  class gnomeClipboardMenu extends PanelMenu.Button {
    // clipboardIcon: St.Icon;
    main_menu: ScrollMenu | null = null;

    _init() {
      super._init(0.0, _("Clipboard"));
      this.clipboardIcon = new St.Icon({
        icon_name: 'edit-copy-symbolic',
        style_class: 'popup-menu-icon'
      })
      this.add_actor(this.clipboardIcon);


       this.setupMenu();

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
    }

    setupMenu() {
      // this.search_box = new SearchBox.SearchBox();
      // this.menu.addMenuItem(this.search_box);

      // let separator1 = new PopupMenu.PopupSeparatorMenuItem();
      // this.menu.addMenuItem(separator1);

      this.main_menu = new ScrollMenu();
      this.menu.addMenuItem(this.main_menu);

      // let separator2 = new PopupMenu.PopupSeparatorMenuItem();
      // this.menu.addMenuItem(separator2);

      // // Toolbar
      // this.action_bar = new ActionBar.ActionBar(this);
      // this.menu.addMenuItem(this.action_bar);

      // this.search_box.onTextChanged(this.onSearchItemChanged.bind(this));
    }

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

    destroy() {
    }
  }
);

function init() {
  ExtensionUtils.initTranslations();
}

let _menu: typeof gnomeClipboardMenu | null = null;
function enable() {
  _menu = new gnomeClipboardMenu();
  Main.panel.addToStatusArea('gnome_clipboard_button', _menu);
}

function disable() {
  if (_menu != null) {
    _menu.destroy();
  }
}
