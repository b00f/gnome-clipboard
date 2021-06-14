// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as utils from 'utils';


export class ClipboardData {
  usage: number;
  text: string;
  pinned: boolean;

  constructor(text: string) {
    this.usage = 1;
    this.text = text;
    this.pinned = false;
  }

  display(): string {
    return utils.truncate(this.text, 32);
  }
}