// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ScrollMenu from 'scrollMenu';
import * as MenuItem from 'menuItem';
import * as utils from 'utils';
import * as log from 'log';

const PopupMenu = imports.ui.popupMenu;

export class HistoryMenu
  extends ScrollMenu.ScrollMenu {
  lookup: Map<number, MenuItem.ClipboardInfo> = new Map();
  selectedID: number;
  updateClipboard: (text: string) => void;

  constructor(updateClipboard: (text: string) => void) {
    super()

    this.updateClipboard = updateClipboard;
    this.selectedID = 0;
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

  _rebuildMenu() {
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

    // TODO: sort

    items.forEach((item, _) => {
      super.addMenuItem(item);
    });
  }

  _addToHistory(text: string, usage: number, pinned: boolean) {
    log.debug(`adding '${text}'`);

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
  }

  onRemoveItem(item: typeof MenuItem.MenuItem) {
    item.destroy();
  }

  onPinItem(item: typeof MenuItem.MenuItem) {
    item.clipboardData.pinned = true;
  }

  onActivateItem(item: typeof MenuItem.MenuItem) {
    this.updateClipboard(item.clipboardData.text);
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