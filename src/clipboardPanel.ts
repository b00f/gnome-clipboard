import St from 'gi://St';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import * as Store from './store.js';
import * as Settings from './settings.js';
import * as HistoryMenu from './historyMenu.js';
import * as History from './history.js';
import * as SearchBox from './searchBox.js';
import * as ActionBar from './actionBar.js';
import * as utils from './utils.js';
import * as log from './log.js';
import * as ClipboardItem from './clipboardItem.js';
import * as ConfirmDialog from './confirmDialog.js';

// GNOME 45+ uses GLib.timeout_add instead of Mainloop
// const Mainloop = imports.mainloop; // Not needed anymore

let _ = (s: string) => s;

export class ClipboardPanel
  extends PanelMenu.Button {

  private _clipboardTimerID = 0;
  private _selectionOwnerChangedID = 0;
  private _openStateChangedID = 0;
  private _keyPressEventID = 0;
  private _settingsChangedID = 0;
  private _saveTimerID = 0;
  private _refreshTimerID = 0;
  private _selection: any;
  private _history: History.History;
  private _historyMenu: HistoryMenu.HistoryMenu;
  private _settings: Settings.ExtensionSettings;
  private _actionBar: ActionBar.ActionBar;
  private _searchBox: SearchBox.SearchBox;
  private _selectedID: number = 0;
  private store: Store.Store;
  private _legacyStorePath: string = "";
  private _openPrefsCallback: (() => void) | null = null;

  static {
    GObject.registerClass(this);
  }

  constructor(settings: any, gettextFunc: (s: string) => string, uuid: string, openPrefsCallback: () => void) {
    // super(menuAlignment, nameText, dontCreateMenu)
    super(1.0, gettextFunc('Gnome Clipboard'), false);
    _ = gettextFunc;
    this._openPrefsCallback = openPrefsCallback;

    log.info("initializing ...");
    this._history = new History.History();
    
    this._selection = Shell.Global.get().get_display().get_selection();
    this._settings = new Settings.ExtensionSettings(settings);

    let path = GLib.get_user_data_dir() + '/' + uuid;
    this._legacyStorePath = GLib.get_user_cache_dir() + '/' + uuid;
    this.store = new Store.Store(path);

    let clipboardIcon = new St.Icon({
      icon_name: 'edit-copy-symbolic',
      style_class: 'popup-menu-icon'
    });
    this.add_child(clipboardIcon);

    this._historyMenu = new HistoryMenu.HistoryMenu(
      this._onActivateItem.bind(this),
      this._onPinItem.bind(this),
      this._onRemoveItem.bind(this),
    );

    this._searchBox = new SearchBox.SearchBox();

    this._actionBar = new ActionBar.ActionBar();
    ActionBar.init(_);
    HistoryMenu.init(_);
    SearchBox.init(_);
    ConfirmDialog.init(_);

    this._setupMenu();
    this._setupListener();

    this._settingsChangedID = this._settings.onChanged(this._onSettingsChanged.bind(this));

    this._openStateChangedID = this._historyMenu.connect('open-state-changed',
      (_widget: any, open: boolean) => {
        log.info(`open-state-changed event: ${open}`);
        if (open) {
          this._startRefreshTimer();
          GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            this._searchBox.setText('');
            global.stage.set_key_focus(this._searchBox.searchEntry);
            return GLib.SOURCE_REMOVE;
          });
        } else {
          this._stopRefreshTimer();
        }
      });

    this._keyPressEventID = this._historyMenu.scrollView.connect('key-press-event',
      (_widget: any, _event: any) => {
        log.debug("key-press event");
        global.stage.set_key_focus(this._searchBox.searchEntry);
        return Clutter.EVENT_PROPAGATE;
      });

    this._actionBar.onClearHistory(() => {
      this._onClearHistory();
    });

    this._actionBar.onOpenSettings(() => {
      if (this._openPrefsCallback) {
        this._openPrefsCallback();
      }
    });

    this._actionBar.onPin(() => {
      this._onPinCurrentItem();
    });

    this._actionBar.onTogglePrivateMode(() => {
      let current = this._settings.privateMode();
      this._settings.setPrivateMode(!current);
    });

    this._actionBar.onNextItem(() => {
      this._selectNextItem();
    });

    this._actionBar.onPrevItem(() => {
      this._selectPrevItem();
    });

    this._searchBox.onTextChanged(this._onSearch.bind(this));
  }

  public async init() {
    log.info("async init starting...");
    let history = await this.store.load();

    if (history.length === 0) {
      const legacyStore = new Store.Store(this._legacyStorePath);
      const legacyHistory = await legacyStore.load();
      if (legacyHistory.length > 0) {
        log.info(`Final data type: ${typeof legacyHistory}, constructor: ${legacyHistory ? legacyHistory.constructor.name : 'null'}`);
        history = legacyHistory;
        await this.store.save(history);
      }
    }

    this._loadHistory(history);
    this._checkClipboard();
  }

  private _setupMenu() {
    this.menu.box.add_style_class_name('gnome-clipboard');

    this.menu.addMenuItem(this._searchBox);
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(this._historyMenu);
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(this._actionBar);
  }

  private _onRemoveItem(item: ClipboardItem.ClipboardItem) {
    this._history.delete(item.id());
  }

  private _onPinItem(item: ClipboardItem.ClipboardItem) {
    log.debug(`pin ${item.display()}`);

    item.pinned = !item.pinned;

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
      this._rebuildMenu();
      return GLib.SOURCE_REMOVE;
    });
  }

  private _onPinCurrentItem() {
    let item = this._history.get(this._selectedID);
    if (item) {
      this._onPinItem(item);
    }
  }

  private async _onActivateItem(item: ClipboardItem.ClipboardItem) {
    log.debug(`update clipboard: ${item.display()} usage: ${item.usage}`);

    await this._copyToClipboard(item);
    this.toggle();
  }
  
  private _onSettingsChanged() {
    log.info("settings changed");

    this._actionBar.setPrivateMode(this._settings.privateMode());
    this._setupListener();
    this._rebuildMenu();
    this._saveHistoryDebounced();
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
    this._addToHistory(text);
    
    if (id == this._selectedID) {
      // Even if it's the same item, we might need to rebuild if sort order changed or to refresh timestamp
      return true; 
    }

    this._selectedID = id;
    return true;
  }

  private async _selectPrevItem() {
    let item = this._historyMenu.prevItem();
    if (item) {
      this._selectedID = item.id();
      this._historyMenu.scrollToItem(this._selectedID);
      await this._copyToClipboard(item);
    }
  }

  private async _selectNextItem() {
    let item = this._historyMenu.nextItem();
    if (item) {
      this._selectedID = item.id();
      this._historyMenu.scrollToItem(this._selectedID);
      await this._copyToClipboard(item);
    }
  }

  private _addToHistory(text: string, usage = 1, pinned = false,
    copiedAt = Date.now(), usedAt = Date.now(), 
    type: ClipboardItem.ClipboardItemType = ClipboardItem.ClipboardItemType.TEXT,
    imagePath: string | null = null) {
    
    let id = type === ClipboardItem.ClipboardItemType.IMAGE ? utils.hashCode(imagePath || "") : utils.hashCode(text);
    let item = this._history.get(id);
    if (item === undefined) {
      item = new ClipboardItem.ClipboardItem(
        text, usage, pinned, copiedAt, usedAt, type, imagePath
      );

      this._history.set(item);
    } else {
      item.updateLastUsed();
    }

    log.debug(`added '${item.display()}' usage: ${item.usage}`);
  }

  private _rebuildMenu() {
    this._history.trim(this._settings.historySize());

    let sorted = this._history.getSorted(this._settings.historySort());
    this._historyMenu.rebuildMenu(sorted, this._selectedID);
    this._onSearch();

    this._actionBar.enablePrevButton(this._historyMenu.hasPrevItem());
    this._actionBar.enableNextButton(this._historyMenu.hasNextItem());
  }

  private _setupListener() {
    this._disconnectClipboardTimer();
    this._disconnectSelectionOwnerChanged();

    let useTimer = this._settings.clipboardTimer();
    if (useTimer || useTimer === undefined) {
      let interval = this._settings.clipboardTimerIntervalInMillisecond();
      if (!interval || interval < 100) {
        interval = 1000;
      }
      log.info(`set timer every ${interval} ms`);

      this._clipboardTimerID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
        this._checkClipboard();
        return GLib.SOURCE_CONTINUE;
      });
    } else {
      let selection = Shell.Global.get().get_display().get_selection();
      this._selectionOwnerChangedID = selection.connect('owner-changed',
        (_selection: any, selectionType: any) => {
          if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
            this._checkClipboard();
          }
        });
    }
  }

  private _checkClipboard() {
    if (!this._actionBar.enable() || this._settings.privateMode()) {
      return;
    }

    let tracker = Shell.WindowTracker.get_default();
    let app = tracker.focus_app;
    if (app) {
        let appId = app.get_id();
        let blacklist = this._settings.blacklist();
        if (appId && blacklist.includes(appId)) {
            log.info(`skipping blacklisted app: ${appId}`);
            return;
        }
    }

    // Use a small delay to ensure the clipboard content is ready
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
        this._selection.get_mimetypes(Meta.SelectionType.SELECTION_CLIPBOARD, (selection: any, res: any) => {
            try {
                let mimetypes = selection.get_mimetypes_finish(res);
                let bestMime = this._findBestTextMime(mimetypes);
                
                if (bestMime) {
                    log.info(`Found best text mime: ${bestMime}`);
                    selection.get_text(Meta.SelectionType.SELECTION_CLIPBOARD, bestMime, null, (selection: any, res: any) => {
                        try {
                            let result = selection.get_text_finish(res);
                            let text = this._safeDecode(result);
                            
                            if (text && text.trim().length > 0) {
                                log.info(`Captured text content: ${text.substring(0, 30)}...`);
                                if (this.addClipboard(text)) {
                                    this._rebuildMenu();
                                    this._saveHistoryDebounced();
                                }
                            } else {
                                this._checkImageClipboard();
                            }
                        } catch (e) {
                            log.error(`Failed to get text content: ${e}`);
                            this._checkImageClipboard();
                        }
                    });
                } else {
                    this._checkImageClipboard();
                }
            } catch (e) {
                log.error(`Failed to handle clipboard: ${e}`);
                this._checkImageClipboard();
            }
        });
        return GLib.SOURCE_REMOVE;
    });
  }

  private _findBestTextMime(mimetypes: string[]): string | null {
      if (!mimetypes) return null;
      const textMimes = ['UTF8_STRING', 'text/plain;charset=utf-8', 'text/plain', 'STRING', 'TEXT'];
      for (let mime of textMimes) {
          if (mimetypes.includes(mime)) return mime;
      }
      return null;
  }

  private _safeDecode(data: any): string {
      if (!data) return "";
      try {
          // Try standard TextDecoder with safety wrapper
          const ui8 = data instanceof Uint8Array ? data : new Uint8Array(data);
          return new TextDecoder().decode(ui8);
      } catch (e) {
          log.warn(`TextDecoder failed, using fallback: ${e}`);
          let text = "";
          let bytes = data;
          if (data && typeof data.get_data === 'function') {
              bytes = data.get_data();
          }
          if (bytes && bytes.length) {
              for (let i = 0; i < bytes.length; i++) {
                  text += String.fromCharCode(bytes[i]);
              }
          }
          return text;
      }
  }

  private _checkImageClipboard() {
    this._selection.get_content(Meta.SelectionType.SELECTION_CLIPBOARD, 'image/png', null, (selection: any, res: any) => {
        try {
            let bytes = selection.get_content_finish(res);
            if (bytes && bytes.get_size() > 0) {
                log.info("Captured image content (image/png)");
                this._processImageBytes(bytes);
            } else {
                // Try JPEG
                this._selection.get_content(Meta.SelectionType.SELECTION_CLIPBOARD, 'image/jpeg', null, (selection: any, res: any) => {
                    try {
                        let bytes = selection.get_content_finish(res);
                        if (bytes && bytes.get_size() > 0) {
                            log.info("Captured image content (image/jpeg)");
                            this._processImageBytes(bytes);
                        }
                    } catch (e) {}
                });
            }
        } catch (e) {
            log.error(`Failed to handle image clipboard: ${e}`);
        }
    });
  }

  private async _processImageBytes(bytes: any) {
    let id = utils.hashBytes(bytes);
    if (id == this._selectedID) return;
    
    let path = await this.store.saveImage(id, bytes);
    if (path) {
        this._selectedID = id;
        this._addToHistory("", 1, false, Date.now(), Date.now(), ClipboardItem.ClipboardItemType.IMAGE, path);
        this._rebuildMenu();
        this._saveHistoryDebounced();
    }
  }

  private async _copyToClipboard(item: ClipboardItem.ClipboardItem) {
    if (item.type === ClipboardItem.ClipboardItemType.IMAGE && item.imagePath) {
        let file = Gio.file_new_for_path(item.imagePath);
        
        try {
            const [contents] = await new Promise<any>((resolve, reject) => {
                file.load_contents_async(null, (file: any, res: any) => {
                    try {
                        resolve(file.load_contents_finish(res));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            
            if (contents) {
                let bytes = GLib.Bytes.new(contents);
                this._selection.set_content(Meta.SelectionType.SELECTION_CLIPBOARD, 'image/png', bytes);
            }
        } catch (e) {
            log.error(`failed to load image for clipboard: ${e}`);
        }
    } else {
        this._selection.set_text(Meta.SelectionType.SELECTION_CLIPBOARD, 'text/plain', item.text);
    }
    
    this._selectedID = item.id();
    this._rebuildMenu();

    if (this._settings.showNotifications()) {
      Main.notify(_("Clipboard updated"), item.display());
    }
  }

  private _onClearHistory() {
    const title = _("Clear history?");
    const message = _("Are you sure you want to remove all items?");
    const sub_message = _("This operation cannot be undone.");

    ConfirmDialog.openConfirmDialog(title, message, sub_message, this._doClearHistory.bind(this), _("Empty"));
  }

  private _doClearHistory(){
    this._history.clear();
    this._saveHistory();
    this._rebuildMenu();
  }

  private _disconnectClipboardTimer() {
    if (this._clipboardTimerID) {
      GLib.source_remove(this._clipboardTimerID);
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
        value.type || ClipboardItem.ClipboardItemType.TEXT,
        value.imagePath || null
      );
    });

    this._rebuildMenu();
  }

  private async _saveHistory() {
    let items = this._history.items(this._settings.savePinned());
    await this.store.save(items);
  }

  private _saveHistoryDebounced() {
    if (this._saveTimerID) {
      GLib.source_remove(this._saveTimerID);
    }
    this._saveTimerID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
      this._saveHistory();
      this._saveTimerID = 0;
      return GLib.SOURCE_REMOVE;
    });
  }

  private _startRefreshTimer() {
      this._stopRefreshTimer();
      // Refresh every minute to update relative timestamps
      this._refreshTimerID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, () => {
          this._updateRelativeTimes();
          return GLib.SOURCE_CONTINUE;
      });
  }

  private _stopRefreshTimer() {
      if (this._refreshTimerID) {
          GLib.source_remove(this._refreshTimerID);
          this._refreshTimerID = 0;
      }
  }

  private _updateRelativeTimes() {
      log.debug("refreshing relative times");
      this._historyMenu.updateItemsUI();
  }

  public toggle() {
    this.menu.toggle();
  }

  public clearHistory() {
    this._onClearHistory();
  }

  public togglePrivateMode() {
    let current = this._settings.privateMode();
    this._settings.setPrivateMode(!current);
  }

  public selectNextItem() {
    this._selectNextItem();
  }

  public selectPrevItem() {
    this._selectPrevItem();
  }

  public destroy() {
    this._disconnectClipboardTimer();
    this._disconnectSelectionOwnerChanged();
    this._stopRefreshTimer();

    if (this._openStateChangedID) {
      this._historyMenu.disconnect(this._openStateChangedID);
      this._openStateChangedID = 0;
    }

    if (this._keyPressEventID) {
      this._historyMenu.scrollView.disconnect(this._keyPressEventID);
      this._keyPressEventID = 0;
    }

    if (this._settingsChangedID) {
      this._settings.getSettings().disconnect(this._settingsChangedID);
      this._settingsChangedID = 0;
    }

    if (this._saveTimerID) {
      GLib.source_remove(this._saveTimerID);
      this._saveTimerID = 0;
      this._saveHistory();
    }

    super.destroy();
  }
}
