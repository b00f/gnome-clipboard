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

  async load(): Promise<any> {
    log.info(`try to load history.`);

    let history: any = [];
    try {
      let file = Gio.file_new_for_path(this._path);
      
      const [contents] = await new Promise<any>((resolve, reject) => {
        file.load_contents_async(null, (file: any, res: any) => {
            try {
                resolve(file.load_contents_finish(res));
            } catch (e) {
                reject(e);
            }
        });
      });

      if (contents) {
        const decoder = new TextDecoder();
        history = JSON.parse(decoder.decode(contents));
      }
    } catch (err) {
      log.error(`an exception occurred: ${err}`);
    }

    return history;
  }

  async save(history: any) {
    log.info(`try to save history.`);

    try {
      let json = JSON.stringify(history);
      let file = Gio.file_new_for_path(this._path);
      const bytes = GLib.Bytes.new(new TextEncoder().encode(json));
      
      await new Promise<void>((resolve, reject) => {
        file.replace_contents_async(bytes, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null, (file: any, res: any) => {
            try {
                file.replace_contents_finish(res);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
      });
    } catch (err) {
      log.error(`an exception occurred: ${err}`);
    }
  }

  async saveImage(id: number, bytes: any): Promise<string | null> {
    let filename = `${id}.png`;
    let path = GLib.build_filenamev([this._imagesDir, filename]);
    try {
      let file = Gio.file_new_for_path(path);
      
      await new Promise<void>((resolve, reject) => {
        file.replace_contents_async(bytes, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null, (file: any, res: any) => {
            try {
                file.replace_contents_finish(res);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
      });
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
