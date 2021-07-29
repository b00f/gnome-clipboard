const St = imports.gi.St;
const GObject = imports.gi.GObject;
const ModalDialog = imports.ui.modalDialog;
const Clutter = imports.gi.Clutter;


export const ConfirmDialog = GObject.registerClass(
  class ConfirmDialog extends ModalDialog.ModalDialog {

    protected _init(
      title: string,
      desc: string,
      okLabel: string,
      cancelLabel: string,
      callback: () => void) {
        super._init();

        let main_box = new St.BoxLayout({
          vertical: false
        });
        this.contentLayout.add_child(main_box);

        let message_box = new St.BoxLayout({
          vertical: true
        });
        main_box.add_child(message_box);

        let subject_label = new St.Label({
          style: 'font-weight: bold',
          x_align: Clutter.ActorAlign.CENTER,
          text: title
        });
        message_box.add_child(subject_label);

        let desc_label = new St.Label({
          style: 'padding-top: 12px',
          x_align: Clutter.ActorAlign.CENTER,
          text: desc
        });
        message_box.add_child(desc_label);

        this.setButtons([
          {
            label: cancelLabel,
            action: () => {
              this.close();
              _confirmDialog = null;
            },
            key: Clutter.Escape
          },
          {
            label: okLabel,
            action: () => {
              this.close();
              callback();
              _confirmDialog = null;
            }
          }
        ]);
    }
  }
);

let _confirmDialog : typeof ConfirmDialog = null ;

export function openConfirmDialog(
  title: string,
  message: string,
  subMessage: string,
  callback: (data: any) => void,
  okLabel = _("OK"),
  cancelLabel = _("Cancel")) {
    if (!_confirmDialog) {
      _confirmDialog = new ConfirmDialog(title, message + "\n" + subMessage, okLabel, cancelLabel, callback);
      _confirmDialog.open();
    }

}