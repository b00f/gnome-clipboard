// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ScrollMenu from 'scrollMenu';
import * as Settings from 'settings';
import * as MenuItem from 'menuItem';
import * as utils from 'utils';
import * as log from 'log';

const PopupMenu = imports.ui.popupMenu;

export class HistoryMenu
  extends ScrollMenu.ScrollMenu {
  private _lookup: Map<number, MenuItem.ClipboardInfo> = new Map();
  private _selectedID: number;
  private _settings: Settings.ExtensionSettings;
  private _updateClipboard: (text: string) => void;

  constructor(
    settings: Settings.ExtensionSettings,
    updateClipboard: (text: string) => void) {
    super()

    this._settings = settings;
    this._updateClipboard = updateClipboard;
    this._selectedID = 0;
  }

  public addClipboard(text: string): boolean {
    if (text === null || text.length === 0) {
      return false;
    }

    let id = utils.hashCode(text);
    if (id == this._selectedID) {
      return false;
    }

    this._selectedID = id;
    this._addToHistory(text);
    this.rebuildMenu();

    return true;
  }

  public rebuildMenu() {
    super.removeAll();

    let items = new Array();
    this._lookup.forEach((cbInfo, _) => {
      let item = new MenuItem.MenuItem(
        cbInfo,
        this._onActivateItem.bind(this),
        this._onRemoveItem.bind(this),
        this._onPinItem.bind(this)
      );

      if (cbInfo.id() == this._selectedID) {
        item.setOrnament(PopupMenu.Ornament.CHECK)
      }

      items.push(item);
    });


    items.sort((l: typeof MenuItem.MenuItem, r: typeof MenuItem.MenuItem): number => {
      if (r.cbInfo.pinned && !l.cbInfo.pinned ) {
        return 1;
      }

      if (!r.cbInfo.pinned && l.cbInfo.pinned ) {
        return -1;
      }

      switch (this._settings.historySort()) {
        case Settings.HISTORY_SORT_RECENT_USAGE:
          return r.cbInfo.usedAt - l.cbInfo.usedAt;

        case Settings.HISTORY_SORT_COPY_TIME:
          return r.cbInfo.copiedAt - l.cbInfo.copiedAt;

        case Settings.HISTORY_SORT_MOST_USAGE:
        default:
          if (r.cbInfo.usage = l.cbInfo.usage) {
            return r.cbInfo.copiedAt - l.cbInfo.copiedAt;
          }
          return r.cbInfo.usage - l.cbInfo.usage;
      }
    });

    let historySize = this._settings.historySize();
    for (let i = historySize; i < items.length; ++i) {
      let item = items.pop();
      this._lookup.delete(item.cbInfo.id());
      item.destroy();
    }

    items.forEach((item, _) => {
      super.addMenuItem(item);
    });
  }

  private _addToHistory(text: string, usage = 1, pinned = false, copiedAt = Date.now(), usedAt = Date.now()) {
    let id = utils.hashCode(text);
    let cbInfo = this._lookup.get(id);
    if (cbInfo === undefined) {
      cbInfo = new MenuItem.ClipboardInfo(
        text, usage, pinned, copiedAt, usedAt
      );

      this._lookup.set(id, cbInfo);
    } else {
      cbInfo.usage++;
    }
    cbInfo.updateLastUsed();

    log.debug(`added '${cbInfo.display()}'`);
  }

  private _onRemoveItem(item: typeof MenuItem.MenuItem) {
    item.destroy();
  }

  private _onPinItem(item: typeof MenuItem.MenuItem) {
    log.debug(`pin ${item.cbInfo.display()}`);

    if (item.cbInfo.pinned) {
      item.cbInfo.pinned = false;
    } else {
      item.cbInfo.pinned = true;
    }

    this.rebuildMenu();
  }

  private _onActivateItem(item: typeof MenuItem.MenuItem) {
    this._updateClipboard(item.cbInfo.text);
  }

  public loadHistory(history: any) {
    history.forEach((value: any) => {
      this._addToHistory(
        value.text,
        value.usage,
        value.pinned,
        value.copiedAt,
        value.usedAt,
      );
    });

    this.rebuildMenu();
  }

  public getHistory(onlyPinned: boolean): any {
    let history: any = [];
    this._lookup.forEach((cbInfo, _) => {
      if (onlyPinned) {
        if (cbInfo.pinned) {
          history.push(cbInfo);
        }
      } else {
        history.push(cbInfo);
      }
    })
    return history;
  }
};