// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as log from 'log';
import * as utils from 'utils';
import * as ClipboardData from 'clipboardData';

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;


export class Store {
  path: string = "";

  constructor(dir: string) {
    // Make sure path exists
    let ret = GLib.mkdir_with_parents(dir, parseInt('0700', 8))
    if (ret == 0) {
      this.path = GLib.build_filenamev([dir, "history.json"]);
      log.debug(`store location set to ${this.path}`);
    } else {
      log.error(`unable to create store directory: ${dir}`);
    }
  }

  load(): ClipboardData.ClipboardData[] {
    log.debug(`try to load history.`);

    let history: ClipboardData.ClipboardData[] = [];
    try {
      let file = Gio.file_new_for_path(this.path);
      let [success, contents] = file.load_contents(null);
      if (success && contents) {
        history = JSON.parse(contents);
      }
    } catch (e) {
      log.error(`an exception occurred: ${e}`);
    }
    return history;
  }

  save(history: ClipboardData.ClipboardData[]) {
    log.debug(`try to save history.`);

    try {
      let json = JSON.stringify(history);
      let contents = new GLib.Bytes(json);
      GLib.file_set_contents(this.path, contents);
    } catch (e) {
      log.error(`an exception occurred: ${e}`);
    }
  }
}
