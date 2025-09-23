import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone
} from '@angular/core';
// @ts-ignore
import { IPlayerModel, IxAPIEvent } from '@lumieducation/h5p-webcomponents';
import {H5pContentService} from "../../../../services/h5p-content.service";

@Component({
  selector: 'app-h5p-player',
  template: `<h5p-player></h5p-player>`
})
export class H5PPlayerComponent implements OnInit, AfterViewInit {
  @Input() contentId!: string;
  @Input() contextId?: string;
  @Input() asUserId?: string;
  @Input() readOnlyState: boolean = false;
  @Output() onInitialized = new EventEmitter<string>();
  @Output() onxAPIStatement = new EventEmitter<{ statement: any; context: any; event: IxAPIEvent }>();

  @ViewChild('h5pPlayer', { static: true }) h5pPlayer!: ElementRef;
  constructor(private contentService: H5pContentService, private el: ElementRef, private zone: NgZone) {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    customElements.whenDefined('h5p-player').then(() => {
      const playerElement = this.el.nativeElement.querySelector('h5p-player');

      if (playerElement) {
        // Thiết lập các thuộc tính
        playerElement.setAttribute('content-id', this.contentId);
        playerElement.setAttribute('context-id', this.contextId || '');
        playerElement.setAttribute('as-user-id', this.asUserId || '');
        playerElement.setAttribute('read-only-state', this.readOnlyState.toString());

        // Thiết lập loadContentCallback
        playerElement.loadContentCallback = (contentId: string, contextId?: string, asUserId?: string, readOnlyState?: boolean) => {
          return this.contentService.getPlay(contentId, contextId, asUserId, readOnlyState).toPromise();
        };

        // Gọi phương thức render
        playerElement.render(this.contentId);
      }
    }).catch(err => {
      console.error('Không thể khởi tạo H5P Player:', err);
    });
    return;
    this.zone.runOutsideAngular(() => {
      const playerElement = this.el.nativeElement.querySelector('h5p-player');
      if (playerElement) {
        console.log(playerElement);
      }
    });
    return;

    const playerElement = this.h5pPlayer.nativeElement;
    console.log('playerElement', playerElement);

    setTimeout(() => {
      console.log(playerElement);
    }, 2000);
    // Thiết lập các sự kiện
    playerElement.addEventListener('initialized', () => {
      this.onInitialized.emit(this.contentId);
    });

    playerElement.addEventListener('xAPIStatement', (event: any) => {
      this.onxAPIStatement.emit({ statement: event.detail.statement, context: event.detail.context, event });
    });

    // Thiết lập loadContentCallback
    playerElement.loadContentCallback(this.contentId, this.contextId, this.asUserId, this.readOnlyState)
      .then((data: IPlayerModel) => {
        console.log(data);
        playerElement.setAttribute('content-id', data.contentId);
      });
  }

  // Giả lập phương thức loadContentCallback
  loadContentCallback(contentId: string, contextId?: string, asUserId?: string, readOnlyState?: boolean): Promise<IPlayerModel> {
    return this.contentService.getPlay(contentId, contextId, asUserId, readOnlyState).toPromise();
  }

  // Hàm resize H5P content nếu cần
  resize(): void {
    this.h5pPlayer.nativeElement.resize();
  }
}
