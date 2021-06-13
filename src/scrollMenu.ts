const { St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

// Derived from PopupMenuSection
// https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/popupMenu.js

export class ScrollMenu
  extends PopupMenu.PopupMenuSection {

  constructor() {
    super();

    // scroll_view
    this.scroll_view = new St.ScrollView({
      overlay_scrollbars: true,
      style_class: "vfade scroll-view",
      clip_to_allocation: true,
    });

    //MMMMM
    // this.scroll_view.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
    this.scroll_view_section = new PopupMenu.PopupMenuSection();
    this.scroll_view.add_actor(this.scroll_view_section.actor);
    this.actor.add_actor(this.scroll_view);
  }

  addMenuItem(item: any) {
    this.scroll_view_section.addMenuItem(item);
  }

  removeAll() {
    this.scroll_view_section.removeAll();
  }

  clearOrnament() {
    let children = this.scroll_view_section._getMenuItems();
    for (let i = 0; i < children.length; i++) {
      let item = children[i];
      item.setOrnament(PopupMenu.Ornament.NONE);
    }
  }
};