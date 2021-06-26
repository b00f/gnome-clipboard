const St = imports.gi.St;
const GObject = imports.gi.GObject;
const ModalDialog = imports.ui.modalDialog;
//const CheckBox = imports.ui.checkBox;
const Clutter = imports.gi.Clutter;




export function openConfirmDialog(
  title: string,
  message: string,
  sub_message: string,
  callback: () => void,
  ok_label = _("OK"),
  cancel_label = _("Cancel")) {
  new ConfirmDialog(title, message + "\n" + sub_message, ok_label, cancel_label, callback).open();
}

export const ConfirmDialog = GObject.registerClass(
  class ConfirmDialog extends ModalDialog.ModalDialog {

    protected _init(
      title: string,
      desc: string,
      ok_label: string,
      cancel_label: string,
      callback: () => void) {
      super._init({
        style_class: 'modal-dialog',
      });

      let main_box = new St.BoxLayout({
        // MMMM
       // vertical: false,
      });
      this.contentLayout.add(main_box, { x_fill: true, y_fill: true });

      let message_box = new St.BoxLayout({
        vertical: true
      });
      main_box.add(message_box, { y_align: St.Align.START });

      let subject_label = new St.Label({
        style: `font-weight: 700`,
        text: title
      });

      message_box.add(subject_label, { y_fill: true, y_align: St.Align.START });

      let desc_label = new St.Label({
        style: 'padding-top: 12px; ',
        text: desc
      });

      message_box.add(desc_label, { y_fill: true, y_align: St.Align.START });

      this.setButtons([
        {
          label: cancel_label,
          action: () => {
            this.close();
          },
          key: Clutter.Escape
        },
        {
          label: ok_label,
          action: () => {
            this.close();
            callback();
          }
        }
      ]);
    }
  }
);