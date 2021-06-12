class cbItem {
  value: string;
  display: string;
  pinned: boolean;

  constructor(d: any) {
    this.value = d.value;
    this.display = d.display;
    this.pinned = (d.pinned == "1") ? true : false;
  }
}

class cbHistory {
  path: string = "";
  items: Array<cbItem>;

  constructor() {
    this.items = new Array<cbItem>();
  }

  setPath(path: string) {
    // Make sure path exists
    if (GLib.mkdir_with_parents(path, parseInt('0644', 8))) {
      this.path = path;
    } else {
      log("Unable to create directory: %s", path);
    }
  }

  load() {
    let file = Gio.file_new_for_path(this.path);

    let [success, contents] = file.load_contents(null);
    if (success) {
      let json = JSON.parse(contents);
      for (var d of json) {
        let item = new cbItem(d);

        this.items.push(item);
      }
    }
  }

  save() {
    let json = JSON.stringify(this.items);
    let contents = new GLib.Bytes(json);

    // Write contents to file asynchronously
    let file = Gio.file_new_for_path(this.path);
    file.replace_async(null, false, Gio.FileCreateFlags.NONE,
      GLib.PRIORITY_DEFAULT, null, function (obj: any, res: any) {

        let stream = obj.replace_finish(res);

        stream.write_bytes_async(contents, GLib.PRIORITY_DEFAULT,
          null, function (w_obj: any, w_res: any) {

            w_obj.write_bytes_finish(w_res);
            stream.close(null);
          });
      }
    );
  }

  addItem() {
    
  }
}
