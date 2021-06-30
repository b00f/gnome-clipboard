// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as Store from 'store';
import * as Settings from 'settings';
import * as HistoryMenu from 'historyMenu';
import * as SearchBox from 'searchBox';
import * as ActionBar from 'actionBar';
import * as log from 'log';

const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const { St, GObject, Meta, Shell, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

var gnomeClipboardMenu = GObject.registerClass(
  class gnomeClipboardMenu extends PanelMenu.Button {

    _clipboardTimerID = 0;
    _selectionOwnerChangedID = 0;

    protected _init() {
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
      this.setupListener();

      this.historyMenu.loadHistory(this.store.load());

      this.settings.onChanged(this.onSettingsChanged.bind(this));

      // Clear search when re-open the menu and set focus on search box
      this.historyMenu.connect('open-state-changed', (_self: any, open: boolean) => {
        log.debug("open-state-changed event");
        if (open) {
          let t = Mainloop.timeout_add(50, () => {
            this.searchBox.setText('');

            // Don't invoke timer again
            Mainloop.source_remove(t);
            return false
          });
        }
      });

      global.stage.connect('key-press-event', (_self: any, _event: any, _data: any) => {
        log.debug("key-press event");
        global.stage.set_key_focus(this.searchBox.searchEntry);
      });
    }

    setupMenu() {
      this.menu.box.style_class = 'popup-menu-content gnome-clipboard';

      this.searchBox = new SearchBox.SearchBox();
      this.menu.addMenuItem(this.searchBox);

      let separator1 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator1);

      this.historyMenu = new HistoryMenu.HistoryMenu(
        this.settings,
        this.updateClipboard.bind(this)
      );
      this.menu.addMenuItem(this.historyMenu);

      let separator2 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator2);

      this.actionBar = new ActionBar.ActionBar();
      this.menu.addMenuItem(this.actionBar);

      this.actionBar.registerOpenSettings(function () {
        ExtensionUtils.openPrefs();
      })

      this.searchBox.onTextChanged(this.onSearchItemChanged.bind(this));
    }

    updateClipboard(text: string) {
      log.debug(`update clipboard: ${text}`);

      this.clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
      this.toggle();
    }

    onSettingsChanged() {
      log.info("settings changed");

      this.setupListener();
      this.historyMenu.refresh();
      this.saveHistory();
    }

    onSearchItemChanged() {
      let query = this.searchBox.getText().toLowerCase();
      this.historyMenu.filterItems(query);
    }

    setupListener() {
      let selection = null;
      try {
        selection = Shell.Global.get().get_display().get_selection();
      } catch (err) {
        log.error(`unable to get selection: ${err}`);
      }

      // Stop and remove previous timer, if exists
      if (this._clipboardTimerID) {
        Mainloop.source_remove(this._clipboardTimerID);
        this._clipboardTimerID = 0;
      }

      if (this._selectionOwnerChangedID) {
        selection.disconnect(this._selectionOwnerChangedID);
        this._selectionOwnerChangedID = 0;
      }

      if (this.settings.clipboardTimer()) {
        let interval = this.settings.clipboardTimerIntervalInMillisecond();
        log.info(`set timer every ${interval} ms`);

        this._clipboardTimerID = Mainloop.timeout_add(interval, () => {
          this.updateHistory();

          // invoke the timer again
          return true;
        });

        log.debug(`_clipboardTimerID: ${this._clipboardTimerID}`);

      } else {
        this._selectionOwnerChangedID = selection.connect('owner-changed', (_selection: any, selectionType: any, _selectionSource: any) => {
          if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
            this.updateHistory();
          }
        });
        log.debug(`_selectionOwnerChangedID: ${this._selectionOwnerChangedID}`);
      }
    }


    updateHistory() {
      if (this.actionBar.privateMode()) return; // Private mode, do not.

      let menu = this;
      // St.Clipboard definition:
      // https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/src/st/st-clipboard.h
      this.clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard: any, text: string) => {
        log.debug(`clipboard content: ${text}`);

        if (menu.historyMenu.addClipboard(text)) {
          this.saveHistory();
        }
      });
    }

    private saveHistory() {
      this.store.save(this.historyMenu.getHistory(false));
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

  if (_menu) {
    _menu.destroy();
  }
}
