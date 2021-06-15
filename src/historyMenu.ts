// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ScrollMenu from 'scrollMenu';
import * as MenuItem from 'menuItem';
import * as ClipboardData from 'clipboardData';

const PopupMenu = imports.ui.popupMenu;

export class HistoryMenu
  extends ScrollMenu.ScrollMenu {
  history: Map<number, typeof MenuItem.MenuItem> = new Map();
  updateClipboard: (text: string) => void;

  constructor(updateClipboard: (text: string) => void) {
    super()

    this.updateClipboard = updateClipboard;
  }

  addClipboard(text: string) {
    if (text === null || text.length === 0) {
      return;
    }

    let data = new ClipboardData.ClipboardData(text);
    let item = this._addMenuItem(data);

    this.clearOrnament();
    item.setOrnament(PopupMenu.Ornament.DOT)
  }

  _addMenuItem(data: ClipboardData.ClipboardData): typeof MenuItem.MenuItem {
    let id = data.id();
    let item = this.history.get(id);
    if (item === undefined) {
      item = new MenuItem.MenuItem(
        data,
        this.onActivateItem.bind(this),
        this.onRemoveItem.bind(this),
        this.onPinItem.bind(this)
      );
      super.addMenuItem(item);
      this.history.set(id, item);
    } else {
      item.data.usage++;
    }

    return item;
  }

  clear() {
    super.removeAll();
  }

  onRemoveItem(item: typeof MenuItem.MenuItem) {
    item.destroy();
  }

  onPinItem(item: typeof MenuItem.MenuItem) {
    item.data.pinned = true;
  }

  onActivateItem(item: typeof MenuItem.MenuItem) {
    this.updateClipboard(item.data.text);
  }

  loadHistory(history: ClipboardData.ClipboardData[]) {
    history.forEach((data) => {
      this.addMenuItem(data);
    })
  }

  getHistory(onlyPinned: boolean): ClipboardData.ClipboardData[] {
    let history: ClipboardData.ClipboardData[] = [];
    this.history.forEach((data, _) => {
      if (onlyPinned) {
        if (data.pinned) {
          history.push(data);
        }
      } else  {
        history.push(data);
      }
    })
    return history;
  }
};