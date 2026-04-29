import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as log from './log.js';

export class Store {
  private _path: string = "";
  private _imagesDir: string = "";

  constructor(dir: string) {
    // Make sure path exists
    let ret = GLib.mkdir_with_parents(dir, parseInt('0700', 8))
    if (ret == 0) {
      this._path = GLib.build_filenamev([dir, "history.json"]);
      this._imagesDir = GLib.build_filenamev([dir, "images"]);
      GLib.mkdir_with_parents(this._imagesDir, parseInt('0700', 8));
      log.info(`store location set to ${this._path}`);
    } else {
      log.error(`unable to create store directory: ${dir}`);
    }
  }

  load(): any {
    log.info(`try to load history.`);

    let history: any = [];
    try {
      let file = Gio.file_new_for_path(this._path);
      let [success, contents] = file.load_contents(null);
      if (success && contents) {
        const decoder = new TextDecoder();
        history = JSON.parse(decoder.decode(contents));
      }
    } catch (err) {
      log.error(`an exception occurred: ${err}`);
    }

    return history;
  }

  save(history: any) {
    log.info(`try to save history.`);

    try {
      let json = JSON.stringify(history);
      GLib.file_set_contents(this._path, json);
    } catch (err) {
      log.error(`an exception occurred: ${err}`);
    }
  }

  saveImage(id: number, bytes: any): string | null {
    let filename = `${id}.png`;
    let path = GLib.build_filenamev([this._imagesDir, filename]);
    try {
      // In GJS, GLib.file_set_contents expects Uint8Array or string.
      // bytes from St.Clipboard is GLib.Bytes, so we need get_data().
      let data = bytes.get_data ? bytes.get_data() : bytes;
      GLib.file_set_contents(path, data);
      return path;
    } catch (err) {
      log.error(`failed to save image: ${err}`);
      return null;
    }
  }

  deleteImage(path: string) {
    try {
      let file = Gio.file_new_for_path(path);
      file.delete(null);
    } catch (err) {
      log.error(`failed to delete image: ${err}`);
    }
  }
}
