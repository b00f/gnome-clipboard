// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ScrollMenu from 'scrollMenu';
import * as MenuItem from 'menuItem';
import * as utils from 'utils';
import * as ClipboardData from 'clipboardData';

const PopupMenu = imports.ui.popupMenu;

export class HistoryMenu
  extends ScrollMenu.ScrollMenu {
  items: Map<number, typeof MenuItem.MenuItem> = new Map();
  updateClipboard: (text: string) => void;

  constructor(updateClipboard: (text: string) => void) {
    super()

    this.updateClipboard = updateClipboard;
  }

  addClipboard(text: string) {
    if (text === null || text.length === 0) {
      return;
    }

    let id = utils.hashCode(text);

    let item = this.items.get(id);
    if (item === undefined) {
      let data = new ClipboardData.ClipboardData(text)

      item = new MenuItem.MenuItem(
        data,
        this.onActivateItem.bind(this),
        this.onRemoveItem.bind(this),
        this.onPinItem.bind(this)
      );

      super.addMenuItem(item);
      this.items.set(id, item);
    } else {
      item.data.usage++;
    }

    this.clearOrnament();
    item.setOrnament(PopupMenu.Ornament.DOT)
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

  loadHistory(history ClipboardData.ClipboardData[]) {
    history.foreach(function(item)) {
      this.addMenuItem(item)
    }
  }
};