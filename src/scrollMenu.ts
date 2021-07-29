// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as log from 'log';

const { St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

// Derived from PopupMenuSection
// https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/js/ui/popupMenu.js

export class ScrollMenu
  extends PopupMenu.PopupMenuSection {

  constructor() {
    super();

    this.scrollView = new St.ScrollView({
      overlay_scrollbars: true,
      style_class: "scroll-view",
      clip_to_allocation: true,
    });


    // Scroll bar policy
    this.scrollView.set_policy(St.PolicyType.NEVER, St.PolicyType.AUTOMATIC);
    this.scrollViewSection = new PopupMenu.PopupMenuSection();
    this.scrollView.add_actor(this.scrollViewSection.actor);
    this.actor.add_actor(this.scrollView);
  }

  filterItems(query: string) {
    log.debug(`filtering ${query}`);

    let items = this.scrollViewSection._getMenuItems();
    if (query === '') {
      items.forEach(function (item: any) {
        item.actor.visible = true;
      });
    }
    else {
      items.forEach(function (item: any) {
        let text = item.text().toLowerCase();
        let matched = text.indexOf(query) >= 0;
        item.actor.visible = matched
      });
    }
  }

  addMenuItem(item: any) {
    this.scrollViewSection.addMenuItem(item);
  }

  removeAll() {
    this.scrollViewSection.removeAll();
  }
};