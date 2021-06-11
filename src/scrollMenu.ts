
class ScrollMenu extends PopupMenu.PopupMenuSection {
  constructor() {
    super();

    // scroll_view
    this.scroll_view = new St.ScrollView({
      overlay_scrollbars: true,
      style_class: "vfade gt-scroll-view",
      clip_to_allocation: true,
    });
    // this.scroll_view.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
    this.scroll_view_section = new PopupMenu.PopupMenuSection();
    this.scroll_view.add_actor(this.scroll_view_section.actor);
    this.actor.add_actor(this.scroll_view);
  }

  addMenuItem(/*item*/) {
    //this.scroll_view_section.addMenuItem(item);
  }

  removeAll() {
    this.scroll_view_section.removeAll();
  }

  getAllItems() {
    return this.scroll_view_section._getMenuItems();
  }
};