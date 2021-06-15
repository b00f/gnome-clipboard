
// @ts-ignore
export function log_methods(obj) {
  var result = [];
  for (var id in obj) {
    try {
      if (typeof (obj[id]) == "function") {
        result.push(id + ": " + obj[id].toString());
      }
    } catch (err) {
      result.push(id + ": inaccessible");
    }
  }

  log(result);
}

// https://stackoverflow.com/questions/9382167/serializing-object-that-contains-cyclic-object-value
// @ts-ignore
export function log_object(obj) {
  let seen: object[] = [];
  let json = JSON.stringify(obj, function (_key, val) {
    if (val != null && typeof val == "object") {
      if (seen.indexOf(val) >= 0) {
        return;
      }
      seen.push(val);
    }
    return val;
  });
  log(json);
}

// Javascript implementation of Java’s String.hashCode() method
// https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
export function hashCode(text: string): number {
  var hash = 0;
  if (text.length == 0) return hash;
  for (let i = 0; i < text.length; i++) {
    let char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export function truncate(text: string, length: number): string {
  text = text.trim();
  text = text.replace(/\s+/g, ' ');

  if (text.length > length) {
    text = text.substr(0, length - 1) + '...';
  }

  return text;
}

// const GLib = imports.gi.GLib;
// const Gio = imports.gi.Gio;
// const St = imports.gi.St;
// const FileQueryInfoFlags = imports.gi.Gio.FileQueryInfoFlags;
// const FileCopyFlags = imports.gi.Gio.FileCopyFlags;
// const FileTest = GLib.FileTest;

// const Clipboard = St.Clipboard.get_default();
// const CLIPBOARD_TYPE = St.ClipboardType.CLIPBOARD;

// const ExtensionUtils = imports.misc.extensionUtils;
// const Me = ExtensionUtils.getCurrentExtension();
// const Prefs = Me.imports.prefs;
// const SettingsSchema = Prefs.SettingsSchema;

// const REGISTRY_DIR = GLib.get_user_cache_dir() + '/' + Me.uuid;
// const REGISTRY_FILE = 'registry.txt';
// const REGISTRY_PATH = REGISTRY_DIR + '/' + REGISTRY_FILE;
// const BACKUP_REGISTRY_PATH = REGISTRY_PATH + '~';


// // I/O Files
// function writeRegistry(registry) {
//     let json = JSON.stringify(registry);
//     let contents = new GLib.Bytes(json);

//     // Make sure dir exists
//     GLib.mkdir_with_parents(REGISTRY_DIR, parseInt('0775', 8));

//     // Write contents to file asynchronously
//     let file = Gio.file_new_for_path(REGISTRY_PATH);
//     file.replace_async(null, false, Gio.FileCreateFlags.NONE,
//         GLib.PRIORITY_DEFAULT, null, function (obj, res) {

//             let stream = obj.replace_finish(res);

//             stream.write_bytes_async(contents, GLib.PRIORITY_DEFAULT,
//                 null, function (w_obj, w_res) {

//                     w_obj.write_bytes_finish(w_res);
//                     stream.close(null);
//                 });
//         });
// }

// function readRegistry(callback) {
//     if (typeof callback !== 'function')
//         throw TypeError('`callback` must be a function');

//     if (GLib.file_test(REGISTRY_PATH, FileTest.EXISTS)) {
//         let file = Gio.file_new_for_path(REGISTRY_PATH);
//         let CACHE_FILE_SIZE = SettingsSchema.get_int(Prefs.Fields.CACHE_FILE_SIZE);

//         file.query_info_async('*', FileQueryInfoFlags.NONE,
//             GLib.PRIORITY_DEFAULT, null, function (src, res) {
//                 // Check if file size is larger than CACHE_FILE_SIZE
//                 // If so, make a backup of file, and invoke callback with empty array
//                 let file_info = src.query_info_finish(res);

//                 if (file_info.get_size() >= CACHE_FILE_SIZE * 1024) {
//                     let destination = Gio.file_new_for_path(BACKUP_REGISTRY_PATH);

//                     file.move(destination, FileCopyFlags.OVERWRITE, null, null);
//                     callback([]);
//                     return;
//                 }

//                 file.load_contents_async(null, function (obj, res) {
//                     let registry;
//                     let [success, contents] = obj.load_contents_finish(res);

//                     if (success) {
//                         try {
//                             let max_size = SettingsSchema.get_int(Prefs.Fields.HISTORY_SIZE);

//                             // are we running gnome 3.30 or higher?
//                             if (contents instanceof Uint8Array) {
//                                 contents = imports.byteArray.toString(contents);
//                             }

//                             registry = JSON.parse(contents);

//                             let registryNoFavorite = registry.filter(
//                                 item => item['favorite'] === false);

//                             while (registryNoFavorite.length > max_size) {
//                                 let oldestNoFavorite = registryNoFavorite.shift();
//                                 let itemIdx = registry.indexOf(oldestNoFavorite);
//                                 registry.splice(itemIdx, 1);

//                                 registryNoFavorite = registry.filter(
//                                     item => item["favorite"] === false);
//                             }
//                         }
//                         catch (e) {
//                             registry = [];
//                         }
//                     }
//                     else {
//                         registry = [];
//                     }

//                     callback(registry);
//                 });
//             });
//     }
//     else {
//         callback([]);
//     }
// }

// function getClipboardText(fn) {
//     Clipboard.get_text(CLIPBOARD_TYPE, fn);
// }

// function setClipboardText(content) {
//     //log("Clipboard set to: '" + content + "'");
//     Clipboard.set_text(CLIPBOARD_TYPE, content);
// }
