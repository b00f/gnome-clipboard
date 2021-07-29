// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as Store from 'store';
import * as Settings from 'settings';
import * as HistoryMenu from 'historyMenu';
import * as SearchBox from 'searchBox';
import * as ActionBar from 'actionBar';
import * as log from 'log';

const Mainloop = imports.mainloop;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const { St, GObject, Meta, Shell, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;


export const ClipboardPanel = GObject.registerClass(
  class ClipboardPanel extends PanelMenu.Button {

    private _clipboardTimerID = 0;
    private _selectionOwnerChangedID = 0;
    private _openStateChangedID = 0;
    private _keyPressEventID = 0;
    // @ts-ignore
    private _historyMenu: HistoryMenu.HistoryMenu;
    // @ts-ignore
    private _settings: Settings.ExtensionSettings;

    protected _init() {
      this._clipboard = St.Clipboard.get_default();
      this._settings = new Settings.ExtensionSettings();

      let path = GLib.get_user_cache_dir() + '/' + Me.uuid;
      this.store = new Store.Store(path);

      super._init(0.0, _("Gnome Clipboard"));

      let clipboardIcon = new St.Icon({
        icon_name: 'edit-copy-symbolic',
        style_class: 'popup-menu-icon'
      })
      this.add_actor(clipboardIcon);

      this._setupMenu();
      this._setupListener();

      this._historyMenu.loadHistory(this.store.load());
      this._settings.onChanged(this._onSettingsChanged.bind(this));

      // Clear search when re-open the menu and set focus on search box
      this._openStateChangedID = this._historyMenu.connect('open-state-changed', (_widget: any, open: boolean) => {
        log.debug("open-state-changed event");
        if (open) {
          let t = Mainloop.timeout_add(50, () => {
            this._searchBox.setText('');

            // Don't invoke timer again
            Mainloop.source_remove(t);
            return false;
          });
        }
      });


      this._keyPressEventID = this._historyMenu.scrollView.connect('key-press-event', (_widget: any, _event: any, _data: any) => {
        log.debug("key-press event");

        global.stage.set_key_focus(this._searchBox.searchEntry);
      });

      this._actionBar.onRemoveAll(() => {
        this._historyMenu.removeAll();
      });

      this._actionBar.onOpenSettings(() => {
        ExtensionUtils.openPrefs();
      })

      this._searchBox.onTextChanged(this._onSearch.bind(this));
    }

    private _setupMenu() {
      this.menu.box.style_class = 'popup-menu-content gnome-clipboard';

      this._searchBox = new SearchBox.SearchBox();
      this.menu.addMenuItem(this._searchBox);

      let separator1 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator1);

      this._historyMenu = new HistoryMenu.HistoryMenu(
        this._settings,
        this._updateClipboard.bind(this)
      );
      this.menu.addMenuItem(this._historyMenu);

      let separator2 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator2);

      this._actionBar = new ActionBar.ActionBar();
      this.menu.addMenuItem(this._actionBar);
    }

    private _updateClipboard(text: string) {
      log.debug(`update clipboard: ${text}`);

      this._clipboard.set_text(St.ClipboardType.CLIPBOARD, text);

      this._toggle();
    }

    private _onSettingsChanged() {
      log.info("settings changed");

      this._setupListener();
      this._historyMenu.rebuildMenu();
      this._saveHistory();
    }

    private _onSearch() {
      let query = this._searchBox.getText().toLowerCase();
      this._historyMenu.filterItems(query);
    }

    private _setupListener() {
      // Stop and remove previous timer, if exists
      this._disconnectClipboardTimer();

      // Disconnect from previous event listener
      this._disconnectSelectionOwnerChanged();

      if (this._settings.clipboardTimer()) {
        let interval = this._settings.clipboardTimerIntervalInMillisecond();
        log.info(`set timer every ${interval} ms`);

        this._clipboardTimerID = Mainloop.timeout_add(interval, () => {
          this._updateHistory();

          // invoke the timer again
          return true;
        });

        log.debug(`_clipboardTimerID: ${this._clipboardTimerID}`);

      } else {
        let selection = Shell.Global.get().get_display().get_selection();
        this._selectionOwnerChangedID = selection.connect('owner-changed', (_selection: any, selectionType: any, _selectionSource: any) => {
          if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
            this._updateHistory();
          }
        });
        log.debug(`_selectionOwnerChangedID: ${this._selectionOwnerChangedID}`);
      }
    }

    private _updateHistory() {
      if (this._actionBar.enable()) {
        return;
      }

      let menu = this;
      // St.Clipboard definition:
      // https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/src/st/st-clipboard.h
      this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard: any, text: string) => {
        log.debug(`clipboard content: ${text}`);

        if (menu._historyMenu.addClipboard(text)) {
          this._saveHistory();
        }
      });
    }

    private _disconnectClipboardTimer() {
      if (this._clipboardTimerID) {
        Mainloop.source_remove(this._clipboardTimerID);
        this._clipboardTimerID = 0;
      }
    }

    private _disconnectSelectionOwnerChanged() {
      if (this._selectionOwnerChangedID) {
        let selection = Shell.Global.get().get_display().get_selection();
        selection.disconnect(this._selectionOwnerChangedID);
        this._selectionOwnerChangedID = 0;
      }
    }

    private _saveHistory() {
      this.store.save(this._historyMenu.getHistory(false));
    }

    private _toggle() {
      this.menu.toggle();
    }

    public destroy() {
      this._disconnectClipboardTimer();
      this._disconnectSelectionOwnerChanged();

      if (this._openStateChangedID) {
        this._historyMenu.disconnect(this._openStateChangedID);
        this._openStateChangedID = 0;
      }

      if (this._keyPressEventID) {
        this._historyMenu.scrollView.disconnect(this._keyPressEventID);
        this._keyPressEventID = 0;
      }

      super.destroy();
    }
  }
);
