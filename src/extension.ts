// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as Store from 'store';
import * as Settings from 'settings';
import * as HistoryMenu from 'historyMenu';
import * as SearchBox from 'searchBox';
import * as ActionBar from 'actionBar';
import * as utils from 'utils';
import * as log from 'log';

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const { St, GObject, Meta, Shell, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

var gnomeClipboardMenu = GObject.registerClass(
  class gnomeClipboardMenu extends PanelMenu.Button {

    _init() {
      this.clipboard = St.Clipboard.get_default();
      this.settings = new Settings.ExtensionSettings();

      let path = GLib.get_user_cache_dir() + '/' + Me.uuid;
      this.store = new Store.Store(path);

      super._init(0.0, _("Gnome Clipboard"));

      this.clipboardIcon = new St.Icon({
        icon_name: 'edit-copy-symbolic',
        style_class: 'popup-menu-icon'
      })
      this.add_actor(this.clipboardIcon);

      this.setupMenu();

      if (this.settings.clipboardTimer()) {
        this.setupTimer();
      } else {
        this.setupListener();
      }

      this.historyMenu.loadHistory(this.store.load());

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
      this.menu.box.style_class = 'popup-menu-content gnome-clipboard';

      this.searchBox = new SearchBox.SearchBox();
      this.menu.addMenuItem(this.searchBox);

      let separator1 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator1);

      this.historyMenu = new HistoryMenu.HistoryMenu(this.updateClipboard.bind(this));
      this.menu.addMenuItem(this.historyMenu);

      let separator2 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator2);

      this.actionBar = new ActionBar.ActionBar();
      this.menu.addMenuItem(this.actionBar);

      // this.search_box.onTextChanged(this.onSearchItemChanged.bind(this));
    }

    updateClipboard(text: string) {
      log.debug(`update clipboard: ${text}`);

      this.clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
      this.toggle();
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
      const selection = display.get_selection();
      if (selection) {

        this._selectionOwnerChangedId = selection.connect('owner-changed', (_selection: any, selectionType: any, _selectionSource: any) => {
          if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
            this.updateHistory();
          }
        });
      }
    }

    setupTimer() {

    }

    updateHistory() {
      if (this.actionBar._privateMode()) return; // Private mode, do not.

      let menu = this;
      // St.Clipboard definition:
      // https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/src/st/st-clipboard.h
      this.clipboard.get_text(St.ClipboardType.CLIPBOARD, function (_clipboard: any, text: string) {
        log.debug(`clipboard content: ${text}`);

        menu.historyMenu.addClipboard(text);
      });
    }

    destroy() {
    }

    toggle() {
      this.menu.toggle();
    }
    close() {
      this.menu.close();
    }

  }
);

// @ts-ignore
function init() {
  log.debug(`initializing...`);
  ExtensionUtils.initTranslations();
}

let _menu: typeof gnomeClipboardMenu | null = null;

// @ts-ignore
function enable() {
  log.debug(`enabling...`);

  if (!_menu) {
    _menu = new gnomeClipboardMenu();
    Main.panel.addToStatusArea('gnome_clipboard_button', _menu);
  }
}

// @ts-ignore
function disable() {
  log.debug(`disabling...`);

  if (_menu != null) {
    _menu.destroy();
  }
}
