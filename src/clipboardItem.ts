import * as utils from './utils.js';

export enum ClipboardItemType {
    TEXT,
    IMAGE
}

export class ClipboardItem {
    public text: string;
    public usage: number;
    public pinned: boolean;
    public copiedAt: number;
    public usedAt: number;
    public type: ClipboardItemType;
    public imagePath: string | null;

    constructor(text: string, usage: number, pinned: boolean, copiedAt: number, usedAt: number, 
                type: ClipboardItemType = ClipboardItemType.TEXT, imagePath: string | null = null) {
      this.text = text;
      this.usage = usage;
      this.pinned = pinned;
      this.copiedAt = copiedAt;
      this.usedAt = usedAt;
      this.type = type;
      this.imagePath = imagePath;
    }

    public id(): number {
      if (this.type === ClipboardItemType.IMAGE && this.imagePath) {
        return utils.hashCode(this.imagePath);
      }
      return utils.hashCode(this.text);
    }

    public display(): string {
      if (this.type === ClipboardItemType.IMAGE) {
        return "[Image]";
      }
      return utils.truncate(this.text, 32);
    }

    public updateLastUsed() {
      this.usage++;
      this.usedAt = Date.now();
    }
  }
