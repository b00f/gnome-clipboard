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
  lookup: Map<number, MenuItem.ClipboardInfo> = new Map();
  selectedID: number;
  settings: Settings.ExtensionSettings;
  updateClipboard: (text: string) => void;

  constructor(
    settings: Settings.ExtensionSettings,
    updateClipboard: (text: string) => void) {
    super()

    this.settings = settings;
    this.updateClipboard = updateClipboard;
    this.selectedID = 0;
  }

  refresh() {
    this._rebuildMenu()
  }

  addClipboard(text: string) {
    if (text === null || text.length === 0) {
      return;
    }

    let id = utils.hashCode(text);
    if (id == this.selectedID) {
      return
    }

    this.selectedID = id;
    this._addToHistory(text, 1, false);
    this._rebuildMenu();
  }

  private _rebuildMenu() {
    super.removeAll();

    let items = new Array();
    this.lookup.forEach((cbInfo, _) => {
      let item = new MenuItem.MenuItem(
        cbInfo,
        this.onActivateItem.bind(this),
        this.onRemoveItem.bind(this),
        this.onPinItem.bind(this)
      );

      if (cbInfo.id() == this.selectedID) {
        item.setOrnament(PopupMenu.Ornament.DOT)
      }

      items.push(item);
    });

    let historySort = this.settings.historySort();
    items.sort(function (l: typeof MenuItem.MenuItem, r: typeof MenuItem.MenuItem): number {
      switch (historySort) {

        case Settings.HISTORY_SORT_RECENT_USAGE:
          return r.cbInfo.used_at - l.cbInfo.used_at;

        case Settings.HISTORY_SORT_COPY_TIME:
          return r.cbInfo.copied_at - l.cbInfo.copied_at;

        case Settings.HISTORY_SORT_MOST_USAGE:
        default:
          return r.cbInfo.usage - l.cbInfo.usage;
      }
    });

    let historySize = this.settings.historySize();
    for( let i=historySize; i<items.length; ++i) {
      let item = items.pop();
      item.destroy();
    }

    items.forEach((item, _) => {
      super.addMenuItem(item);
    });
  }

  private _addToHistory(text: string, usage: number, pinned: boolean) {
    let id = utils.hashCode(text);
    let cbInfo = this.lookup.get(id);
    if (cbInfo === undefined) {
      cbInfo = new MenuItem.ClipboardInfo(
        text, usage, pinned
      );

      this.lookup.set(id, cbInfo);
    } else {
      cbInfo.usage++;
    }
    cbInfo.updateLastUsed();

    log.debug(`added '${cbInfo.display()}'`);
  }

  onRemoveItem(item: typeof MenuItem.MenuItem) {
    item.destroy();
  }

  onPinItem(item: typeof MenuItem.MenuItem) {
    item.cbInfo.pinned = true;
  }

  onActivateItem(item: typeof MenuItem.MenuItem) {
    this.updateClipboard(item.cbInfo.text);
  }

  loadHistory(history: any) {
    history.forEach((value: any) => {
      this._addToHistory(
        value.text,
        value.usage,
        value.pinned
      );
    });

    this._rebuildMenu();
  }

  getHistory(onlyPinned: boolean): any {
    let history: any = [];
    this.lookup.forEach((cbInfo, _) => {
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