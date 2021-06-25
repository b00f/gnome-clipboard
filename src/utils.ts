// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

const GLib = imports.gi.GLib;
const ByteArray = imports.byteArray;

import * as log from 'log';

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

  log.info(result.toString());
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
  log.info(json);
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

// @ts-ignore
export function truncate(text: string, length: number): string {
  text = text.trim();
  text = text.replace(/\s+/g, ' ');

  if (text.length > length) {
    text = text.substr(0, length - 1) + '...';
  }

  return text;
}


// @ts-ignore
export function spawn_async(...args) {
  try {
    let flags = GLib.SpawnFlags.SEARCH_PATH;
    GLib.spawn_async(null, args, null, flags, null);
  } catch (err) {
    log.error(`an exception occurred: ${err}`);
  }
}

// @ts-ignore
export function spawn_sync(...args) {
  try {
    let flags = GLib.SpawnFlags.SEARCH_PATH;
    let [_success, _out, err, _errno] = GLib.spawn_sync(null, args, null, flags, null);
    // Clear warning: Some code called array.toString() on a Uint8Array instance. Previously this would have interpreted ....
    let err_string = ByteArray.toString(err);
    if (err_string != "") {
      log.error(`an error occurred: ${err}`);
      return false;
    }

    return true;
  } catch (err) {
    log.error(`an exception occurred: ${err}`);
  }
}