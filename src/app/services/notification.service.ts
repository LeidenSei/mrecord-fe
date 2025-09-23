import { Injectable } from '@angular/core';
import notify from 'devextreme/ui/notify';
@Injectable()
export class NotificationService {
  constructor(
  ) {
  }
  showNotification(type: string, message: string) {
    notify({
        message: `${message}`,
        /*position: { at: 'bottom center', my: 'bottom center' }*/
      },
      type);

    /*this.notification.create(
      type,
      message,
      null,
      {
        nzStyle: {
          fontWeight: 'lighter',
          fontSize: 'larger'
        },
        nzDuration: 5000,
      }
    );*/
  }
}
