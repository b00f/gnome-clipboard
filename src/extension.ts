const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const { Gio, GLib, Pango, St, GObject } = imports.gi;
const { Shell } = imports.gi;
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
    search_box: typeof SearchBox | null = null;
    selection: any | null = null;

    _init() {
      log(`initializing  ${Me.metadata.name}`);

      super._init(0.0, _("Clipboard"));
      this.clipboardIcon = new St.Icon({
        icon_name: 'edit-copy-symbolic',
        style_class: 'popup-menu-icon'
      })
      this.add_actor(this.clipboardIcon);


      this.setupMenu();
      this.setupListener();

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
    }

    setupMenu() {
      this.search_box = new SearchBox();
      this.menu.addMenuItem(this.search_box);

      let separator1 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator1);

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

    setupListener() {
      const display = Shell.Global.get().get_display();


      // MMMM
      // Move this logic inside setupTracker. Then if failed => setup Timer.
      // CLIPBOARD_LISTENER  -> check https://github.com/b00f/gnome-shell-extension-clipboard-indicator/commit/ce531c16c3c183c1b7d593893018f0822a61e39f
      if (typeof display.get_selection === 'function') {
        const selection = display.get_selection();
        this.setupTracker(selection);
      }
      else {
        this.setupTimeout();
      }
    }

    setupTracker(selection: any) {
      this.selection = selection;
      this._selectionOwnerChangedId = selection.connect('owner-changed', (selection1: any, selectionType: any, selectionSource: any) => {
        log(`selection: ${selection1}, ${selectionType}, ${selectionSource})`)

        if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
          this.updateHistory();
        }
      });
    }

    setupTimeout() {

    }

    updateHistory() {
      //if (this.actionBar._privateMode()) return; // Private mode, do not.



      // Utils.getClipboardText(function (clipBoard, text) {
      //   log("clipboard: %s, %s", clipBoard, text)
      // });
    }

    destroy() {
    }
  }
);

function init() {
  ExtensionUtils.initTranslations();
}

let _menu: typeof gnomeClipboardMenu | null = null;
function enable() {
  log(`enabling ${Me.metadata.name}`);

  _menu = new gnomeClipboardMenu();
  Main.panel.addToStatusArea('gnome_clipboard_button', _menu);
}

function disable() {
  if (_menu != null) {
    _menu.destroy();
  }
}
