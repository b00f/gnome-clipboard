imports.gi.versions.Gda = "5.0";


const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gda = imports.gi.Gda;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter;
const ByteArray = imports.byteArray;
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ActionBar = Me.imports.actionBar;
const ConfirmDialog = Me.imports.confirmDialog;
const ScrollMenu = Me.imports.scrollMenu;
const SearchBox = Me.imports.searchBox;
const Utils = Me.imports.utils;


const Gettext = imports.gettext.domain("gnome-clipboard");
const _ = Gettext.gettext;


const gnomeClipboardMenu = GObject.registerClass(
  class gnomeClipboardMenu extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("Clipboard"));
      this.clipboardIcon = new St.Icon({
        icon_name: 'edit-copy-symbolic',
        style_class: 'popup-menu-icon'
      })
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
    }

    setupDatabase() {
      //
      // GJS database tutorial can be found here:
      // https://developer.gnome.org/gnome-devel-demos/stable/record-collection.js.html.en
      //
      try {
        this.connection = new Gda.Connection({
          provider: Gda.Config.get_provider("SQLite"),
          cnc_string: "DB_DIR=" + GLib.get_home_dir() + ";DB_NAME=" + Me.uuid
        });
        this.connection.open();
        Main.notifyError(_("Gnome-trash failed to start"), _("No trash folder is detected."));
      } catch (e) {

      }

      try {
        var dm = this.connection.execute_select_command("select * from demo");
      } catch (e) {
        this.connection.execute_non_select_command("create table demo (id integer, name varchar(100))");
      }
    }

    setupMenu() {
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
    }

    onSearchItemChanged() {
      let query = this.search_box.getText().toLowerCase();

      if (query === '') {
        this.trash_menu.getAllItems().forEach(function (item) {
          item.actor.visible = true;
        });
      }
      else {
        this.trash_menu.getAllItems().forEach(function (item) {
          let text = item.file_name.toLowerCase();
          let matched = text.indexOf(query) >= 0;
          item.actor.visible = matched
        });
      }
    }

    destroy() {
      super.destroy();
    }


  }
);


function init() {
  ExtensionUtils.initTranslations();
}

let _gnomeClipboard;
function enable() {
  _gnomeClipboard = new gnomeClipboardMenu;
  Main.panel.addToStatusArea('gnome_clipboard_button', _gnomeClipboard);
}

function disable() {
  _gnomeClipboard.destroy();
}
