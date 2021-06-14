// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as log from 'log';
import * as utils from 'utils';
import * as ClipboardData from 'clipboardData';

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;


export class Cache {
  path: string = "";

  constructor() {
    utils.log_methods(GLib);
    log.debug("--------------------");
    let file = Gio.file_new_for_path(".");
    utils.log_methods(file);
  }

  setPath(path: string) {
    utils.log_methods(GLib);
    utils.log_methods(Gio);
    // Make sure path exists
    if (GLib.mkdir_with_parents(path, parseInt('0644', 8))) {
      this.path = path;
    } else {
      log.warn(`Unable to create directory: ${path}`);
    }
  }

  load(): ClipboardData.ClipboardData[] {
    let file = Gio.file_new_for_path(this.path);

    // },replace_contents: function replace_contents(contents, etag, make_backup, flags, cancellable) {
    let [success, contents] = file.load_contents(null);
    if (success) {
      return JSON.parse(contents);
    }
    return [];
  }

  save(history: ClipboardData.ClipboardData[]) {
    let json = JSON.stringify(history);
    let file = Gio.file_new_for_path(this.path);
    file.replace_contents(json, "", true, null);
  }

}
