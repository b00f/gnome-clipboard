// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as Store from 'store';
import * as Settings from 'settings';
import * as HistoryMenu from 'historyMenu';
import * as History from 'history';
import * as SearchBox from 'searchBox';
import * as ActionBar from 'actionBar';
import * as utils from 'utils';
import * as log from 'log';
import * as ClipboardItem from 'clipboardItem';

const Mainloop = imports.mainloop;
const Main = imports.ui.main;
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
    private _history: History.History;
    private _historyMenu: HistoryMenu.HistoryMenu;
    private _settings: Settings.ExtensionSettings;
    // @ts-ignore
    private _actionBar: ActionBar.ActionBar;

    constructor() {
      // supe(menuAlignment, nameText, dontCreateMenu)
      super(1.0, _('Gnome Clipboard'), false);

      log.info("initializing ...")
      this._history = new History.History();
      this._clipboard = St.Clipboard.get_default();
      this._settings = new Settings.ExtensionSettings();

      let path = GLib.get_user_cache_dir() + '/' + Me.uuid;
      this.store = new Store.Store(path);

      let clipboardIcon = new St.Icon({
        icon_name: 'edit-copy-symbolic',
        style_class: 'popup-menu-icon'
      })
      this.add_actor(clipboardIcon);

      this._historyMenu = new HistoryMenu.HistoryMenu(
        this._onActivateItem.bind(this),
        this._onPinItem.bind(this),
        this._onRemoveItem.bind(this),
      );

      this._setupMenu();
      this._setupListener();

      this._loadHistory(this.store.load());
      this._settings.onChanged(this._onSettingsChanged.bind(this));

      // Clear search when re-open the menu and set focus on search box
      this._openStateChangedID = this._historyMenu.connect('open-state-changed',
        (_widget: any, open: boolean) => {
          log.info("open-state-changed event");
          if (open) {
            let t = Mainloop.timeout_add(50, () => {
              this._searchBox.setText('');
              global.stage.set_key_focus(this._searchBox.searchEntry);

              // Don't invoke timer again
              Mainloop.source_remove(t);
              return false;
            });
          }
        });

      this._keyPressEventID = this._historyMenu.scrollView.connect('key-press-event',
        (_widget: any, _event: any, _data: any) => {
          log.debug("key-press event");

          global.stage.set_key_focus(this._searchBox.searchEntry);
        });

      this._actionBar.onRemoveAll(() => {
        this._history.clear();
        this._saveHistory();
        this._rebuildMenu();
      });

      this._actionBar.onOpenSettings(() => {
        ExtensionUtils.openPrefs();
      })

      this._actionBar.onNextItem(() => {
        this._selectNextItem();
      })

      this._actionBar.onPrevItem(() => {
        this._selectPrevItem();
      })

      this._searchBox.onTextChanged(this._onSearch.bind(this));
    }

    private _setupMenu() {
      this.menu.box.style_class = 'popup-menu-content gnome-clipboard';

      this._searchBox = new SearchBox.SearchBox();
      this.menu.addMenuItem(this._searchBox);

      let separator1 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator1);

      this.menu.addMenuItem(this._historyMenu);

      let separator2 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(separator2);

      this._actionBar = new ActionBar.ActionBar();
      this.menu.addMenuItem(this._actionBar);
    }

    private _onRemoveItem(item: ClipboardItem.ClipboardItem) {
      this._history.delete(item.id());
    }

    private _onPinItem(item: ClipboardItem.ClipboardItem) {
      log.debug(`pin ${item.display()}`);

      if (item.pinned) {
        item.pinned = false;
      } else {
        item.pinned = true;
      }

      let t = Mainloop.timeout_add(100, () => {
        this._rebuildMenu();

        // Don't invoke timer again
        Mainloop.source_remove(t);
        return false;
      });
    }

    private _onActivateItem(item: ClipboardItem.ClipboardItem) {
      log.debug(`update clipboard: ${item.display()} usage: ${item.usage}`);

      this._copyToClipboard(item);
      this._toggle();
    }
    private _onSettingsChanged() {
      log.info("settings changed");

      this._setupListener();
      this._rebuildMenu();
      this._saveHistory();
    }

    private _onSearch() {
      let query = this._searchBox.getText().toLowerCase();
      this._historyMenu.filterItems(query);
    }

    private addClipboard(text: string): boolean {
      if (text === null || text.length === 0) {
        return false;
      }

      let id = utils.hashCode(text);
      if (id == this._selectedID) {
        return false;
      }

      this._selectedID = id;
      this._addToHistory(text);

      return true;
    }

    private _selectPrevItem() {
      let item = this._historyMenu.prevItem();
      if (item) {
        this._copyToClipboard(item);
      }
    }

    private _selectNextItem() {
      let item = this._historyMenu.nextItem();
      if (item) {
        this._copyToClipboard(item);
      }
    }

    private _addToHistory(text: string, usage = 1, pinned = false,
      copiedAt = Date.now(), usedAt = Date.now()) {
      let id = utils.hashCode(text);
      let item = this._history.get(id);
      if (item === undefined) {
        item = new ClipboardItem.ClipboardItem(
          text, usage, pinned, copiedAt, usedAt
        );

        this._history.set(item);
      } else {
        item.updateLastUsed();
      }

      log.debug(`added '${item.display()}' usage: ${item.usage}`);
    }

    private _rebuildMenu() {
      // Trim the history
      this._history.trim(this._settings.historySize());

      let sorted = this._history.getSorted(this._settings.historySort());
      this._historyMenu.rebuildMenu(sorted, this._selectedID);
      this._onSearch();

      this._actionBar.enablePrevButton(this._historyMenu.hasPrevItem());
      this._actionBar.enableNextButton(this._historyMenu.hasNextItem());
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
          this._checkClipboard();

          // invoke the timer again
          return true;
        });


      } else {
        let selection = Shell.Global.get().get_display().get_selection();
        this._selectionOwnerChangedID = selection.connect('owner-changed',
          (_selection: any, selectionType: any, _selectionSource: any) => {
            if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
              this._checkClipboard();
            }
          });
      }
    }

    private _checkClipboard() {
      if (!this._actionBar.enable()) {
        return;
      }

      // St.Clipboard definition:
      // https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/src/st/st-clipboard.h
      this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard: any, text: string) => {
        log.info(`set clipboard content: ${text}`);

        if (this.addClipboard(text)) {
          this._rebuildMenu();
          this._saveHistory();
        }
      });
    }

    private _copyToClipboard(item: ClipboardItem.ClipboardItem) {
      this._clipboard.set_text(St.ClipboardType.CLIPBOARD, item.text);
      this._selectedID = item.id();
      this._rebuildMenu();

      if (this._settings.showNotifications()) {
        Main.notify(_("Clipboard updated"), item.text);
      }
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

    private _loadHistory(history: any) {
      history.forEach((value: any) => {
        this._addToHistory(
          value.text,
          value.usage,
          value.pinned,
          value.copiedAt,
          value.usedAt,
        );
      });

      this._rebuildMenu();
    }

    private _saveHistory() {
      let items = this._history.items(this._settings.savePinned());
      this.store.save(items);
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
