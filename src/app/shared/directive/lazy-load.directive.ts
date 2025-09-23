import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]'
})
export class LazyLoadDirective implements OnInit {
  @Input() appLazyLoad!: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const img = this.el.nativeElement
    console.log(img);
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = this.appLazyLoad;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  }
}
