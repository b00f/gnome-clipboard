const { St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

// Derived from PopupMenuSection
// https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/popupMenu.js

export class ScrollMenu
  extends PopupMenu.PopupMenuSection {

  constructor() {
    super();

    this.scrollView = new St.ScrollView({
      overlay_scrollbars: true,
      style_class: "vfade scroll-view",
      clip_to_allocation: true,
    });


    // Scroll bar policy
    this.scrollView.set_policy(St.PolicyType.NEVER, St.PolicyType.AUTOMATIC);
    this.scrollViewSection = new PopupMenu.PopupMenuSection();
    this.scrollView.add_actor(this.scrollViewSection.actor);
    this.actor.add_actor(this.scrollView);
  }

  addMenuItem(item: any) {
    this.scrollViewSection.addMenuItem(item);
  }

  removeAll() {
    this.scrollViewSection.removeAll();
  }

  allItems() {
    return this.scrollViewSection._getMenuItems();
  }

  clearOrnament() {
    let children = this.scrollViewSection._getMenuItems();
    for (let i = 0; i < children.length; i++) {
      let item = children[i];
      item.setOrnament(PopupMenu.Ornament.NONE);
    }
  }
};