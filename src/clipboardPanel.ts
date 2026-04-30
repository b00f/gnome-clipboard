import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';

import * as History from './history.js';
import * as HistoryMenu from './historyMenu.js';
import * as Settings from './settings.js';
import * as ClipboardItem from './clipboardItem.js';
import * as Store from './store.js';
import * as log from './log.js';
import * as utils from './utils.js';
import * as ConfirmDialog from './confirmDialog.js';
import * as ActionBar from './actionBar.js';
import * as SearchBox from './searchBox.js';

let _ = (s: string) => s;

export function init(gettextFunc: (s: string) => string) {
    _ = gettextFunc;
}

class ClipboardPanelInternal extends PanelMenu.Button {
  private _history: History.History;
  private _historyMenu: HistoryMenu.HistoryMenu;
  private _settings: Settings.ExtensionSettings;
  private _actionBar: ActionBar.ActionBar;
  private _searchBox: SearchBox.SearchBox;
  private _store: Store.Store;
  private _openPrefs: () => void;
  
  private _clipboardTimerID: number = 0;
  private _saveTimerID: number = 0;
  private _selectedID: number = 0;
  private _openStateChangedID: number = 0;
  private _keyPressEventID: number = 0;
  private _focusTimerID: number = 0;

  constructor(settings: any, _gettext: any, uuid: string, openPrefs: () => void) {
    super(0.0, _("Clipboard"), false);

    log.info("initializing ...");
    this._history = new History.History();
    this._settings = new Settings.ExtensionSettings(settings);
    this._openPrefs = openPrefs;

    let path = GLib.get_user_data_dir() + '/' + uuid;
    this._store = new Store.Store(path);

    this._actionBar = new ActionBar.ActionBar();
    this._searchBox = new SearchBox.SearchBox();
    this._historyMenu = new HistoryMenu.HistoryMenu(
        this._copyToClipboard.bind(this),
        this._onPinItem.bind(this),
        this._onRemoveItem.bind(this)
    );
    
    // Menu layout: Search → History → Action Bar
    this.menu.addMenuItem(this._searchBox);
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(this._historyMenu);
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(this._actionBar);

    this._setupUI();
    this._loadHistory();
    this._setupClipboardMonitoring();
  }

  public init() {
      // Compatibility with extension.ts
  }

  public toggle() {
      this.menu.toggle();
  }

  private _setupUI() {
    this.menu.box.add_style_class_name('gnome-clipboard');

    let icon = new St.Icon({
      icon_name: 'edit-paste-symbolic',
      style_class: 'system-status-icon'
    });
    this.add_child(icon);

    this._actionBar.onClearHistory(this.clearHistory.bind(this));
    this._actionBar.onNextItem(this.selectNextItem.bind(this));
    this._actionBar.onPrevItem(this.selectPrevItem.bind(this));
    this._actionBar.onTogglePrivateMode(this.togglePrivateMode.bind(this));
    this._actionBar.onOpenSettings(() => this._openPrefs());

    // Search box: filter items as user types
    this._searchBox.onTextChanged(this._onSearch.bind(this));

    // Auto-focus search box when menu opens
    this._openStateChangedID = this.menu.connect('open-state-changed',
      (_menu: any, open: boolean) => {
        if (open) {
          if (this._focusTimerID) GLib.source_remove(this._focusTimerID);
          this._focusTimerID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            this._searchBox.setText('');
            global.stage.set_key_focus(this._searchBox.searchEntry);
            this._focusTimerID = 0;
            return GLib.SOURCE_REMOVE;
          });
        }
      });

    // Redirect key presses from scroll view to search box
    this._keyPressEventID = this._historyMenu.scrollView.connect('key-press-event',
      (_widget: any, _event: any) => {
        global.stage.set_key_focus(this._searchBox.searchEntry);
        return Clutter.EVENT_PROPAGATE;
      });
  }

  private async _loadHistory() {
    let history = await this._store.load();
    if (history && history.length > 0) {
        this._history.setItems(history);
        this._rebuildMenu();
    }
  }

  private _setupClipboardMonitoring() {
    this._clipboardTimerID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        this._checkClipboard();
        return GLib.SOURCE_CONTINUE;
    });
  }

  private _checkClipboard() {
    if (!this._actionBar.enable() || this._settings.privateMode()) return;

    const ST = (St as any);
    const clipboard = ST['Clipboard']['get_default']();
    
    clipboard.get_text(ST['ClipboardType']['CLIPBOARD'], (_cb: any, text: string) => {
        try {
            if (text && text.trim().length > 0) {
                if (this._addClipboard(text)) {
                    this._rebuildMenu();
                    this._saveHistoryDebounced();
                }
            } else {
                this._checkImageClipboard();
            }
        } catch (e) {
            log.error(`Check clipboard failed: ${e}`);
        }
    });
  }

  private _checkImageClipboard() {
    const ST = (St as any);
    const clipboard = ST['Clipboard']['get_default']();
    
    clipboard.get_content(ST['ClipboardType']['CLIPBOARD'], 'image/png', (_cb: any, bytes: any) => {
        try {
            if (bytes && bytes.get_size() > 0) {
                this._processImageBytes(bytes);
            }
        } catch (e) {}
    });
  }

  private async _processImageBytes(bytes: any) {
    let id = utils.hashBytes(bytes);
    if (id == this._selectedID) return;
    
    let path = await this._store.saveImage(id, bytes);
    if (path) {
        this._selectedID = id;
        this._addToHistory("", 1, false, Date.now(), Date.now(), ClipboardItem.ClipboardItemType.IMAGE, path);
        this._rebuildMenu();
        this._saveHistoryDebounced();
    }
  }

  private _addClipboard(text: string): boolean {
    let id = utils.hashCode(text);
    if (id == this._selectedID) return false;

    this._selectedID = id;
    return this._addToHistory(text, 1, false, Date.now(), Date.now(), ClipboardItem.ClipboardItemType.TEXT);
  }

  private _addToHistory(text: string, count: number, pinned: boolean, created: number, updated: number, type: number, path?: string): boolean {
    let item = new ClipboardItem.ClipboardItem(text, count, pinned, created, updated, type, path);
    return this._history.add(item);
  }

  private async _copyToClipboard(item: ClipboardItem.ClipboardItem) {
    const ST = (St as any);
    const clipboard = ST['Clipboard']['get_default']();

    if (item.type === ClipboardItem.ClipboardItemType.IMAGE && item.imagePath) {
        let file = Gio.file_new_for_path(item.imagePath);
        file.load_contents_async(null, (_f: any, res: any) => {
            try {
                let [contents] = file.load_contents_finish(res);
                if (contents) {
                    let bytes = GLib.Bytes.new(contents);
                    clipboard.set_content(ST['ClipboardType']['CLIPBOARD'], 'image/png', bytes);
                }
            } catch (e) {
                log.error(`Failed to load image for copy: ${e}`);
            }
        });
    } else {
        clipboard.set_text(ST['ClipboardType']['CLIPBOARD'], item.text);
    }
    
    this._selectedID = item.id();
    this._rebuildMenu();

    if (this._settings.showNotifications()) {
      Main.notify(_("Clipboard updated"), item.display());
    }
  }

  public toggleService() {
      // Manual toggle via switch in ActionBar is handled there
  }

  public clearHistory() {
      const title = _("Clear history?");
      const message = _("Are you sure you want to remove all items?");
      ConfirmDialog.openConfirmDialog(title, message, "", this._doClearHistory.bind(this), _("Empty"));
  }

  public togglePrivateMode() {
      this._settings.setPrivateMode(!this._settings.privateMode());
      this._actionBar.setPrivateMode(this._settings.privateMode());
  }

  public selectNextItem() {
      const next = this._historyMenu.nextItem();
      if (next) this._copyToClipboard(next);
  }

  public selectPrevItem() {
      const prev = this._historyMenu.prevItem();
      if (prev) this._copyToClipboard(prev);
  }

  private _rebuildMenu() {
    this._historyMenu.rebuildMenu(this._history.getSorted(this._settings.historySort()), this._selectedID);
    this._onSearch();
    this._actionBar.enablePrevButton(this._historyMenu.hasPrevItem());
    this._actionBar.enableNextButton(this._historyMenu.hasNextItem());
  }

  private _onSearch() {
    let query = this._searchBox.getText().toLowerCase();
    this._historyMenu.filterItems(query);
  }

  private _onPinItem(item: ClipboardItem.ClipboardItem) {
      item.pinned = !item.pinned;
      this._rebuildMenu();
      this._saveHistoryDebounced();
  }

  private _onRemoveItem(item: ClipboardItem.ClipboardItem) {
      this._history.delete(item.id());
      this._rebuildMenu();
      this._saveHistoryDebounced();
  }

  private _saveHistoryDebounced() {
    if (this._saveTimerID) GLib.source_remove(this._saveTimerID);
    this._saveTimerID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        this._store.save(this._history.getItems());
        this._saveTimerID = 0;
        return GLib.SOURCE_REMOVE;
    });
  }

  private _doClearHistory(){
    this._history.clear();
    this._store.save([]);
    this._rebuildMenu();
  }

  destroy() {
    if (this._clipboardTimerID) GLib.source_remove(this._clipboardTimerID);
    if (this._saveTimerID) GLib.source_remove(this._saveTimerID);
    if (this._focusTimerID) GLib.source_remove(this._focusTimerID);

    if (this._openStateChangedID) {
      this.menu.disconnect(this._openStateChangedID);
      this._openStateChangedID = 0;
    }

    if (this._keyPressEventID) {
      this._historyMenu.scrollView.disconnect(this._keyPressEventID);
      this._keyPressEventID = 0;
    }

    super.destroy();
  }
}

export interface ClipboardPanel extends ClipboardPanelInternal {}
export var ClipboardPanel = GObject.registerClass({
    GTypeName: 'ClipboardPanel'
}, ClipboardPanelInternal);
