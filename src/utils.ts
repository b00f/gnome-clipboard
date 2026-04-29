import GLib from 'gi://GLib';
// In GNOME 45+, imports.byteArray is deprecated. Use standard JS methods or GLib.
// However, GJS still supports it for now, but let's try to be clean.

import * as log from './log.js';

export function log_methods(obj: any) {
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

export function log_object(obj: any) {
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
    text = text.substring(0, length - 1) + '...';
  }

  return text;
}

export function spawnAsync(...args: string[]) {
  try {
    let flags = GLib.SpawnFlags.SEARCH_PATH;
    GLib.spawn_async(null, args, null, flags, null);
  } catch (err) {
    log.error(`an exception occurred: ${err}`);
  }
}

export function spawnSync(...args: string[]) {
  try {
    let flags = GLib.SpawnFlags.SEARCH_PATH;
    let [_success, _out, err, _errno] = GLib.spawn_sync(null, args, null, flags, null);
    
    if (err && err.length > 0) {
        // Use TextDecoder instead of byteArray
        const decoder = new TextDecoder();
        let err_string = decoder.decode(err);
        if (err_string != "") {
          log.error(`an error occurred: ${err_string}`);
          return false;
        }
    }

    return true;
  } catch (err) {
    log.error(`an exception occurred: ${err}`);
  }
}