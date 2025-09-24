import { Directive, ElementRef,  OnDestroy, OnInit } from '@angular/core';


@Directive({
  selector: '[header-height]',
  standalone: true
})
export class HeaderHeightDirective implements OnInit, OnDestroy {
  private ro?: ResizeObserver;

  constructor(private host: ElementRef<HTMLElement> ) {}

  ngOnInit(): void {
    this.updateCSSVars();

    if ('ResizeObserver' in window) {
      this.ro = new ResizeObserver(() => this.updateCSSVars());
      this.ro.observe(this.host.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }



  private updateCSSVars() {
    const el = this.host.nativeElement;
    const h = el.getBoundingClientRect().height;
    let cssContent: string = '';
    const STYLE_ID = 'header-css-vars';
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;

    cssContent += `--header-height: ${h}px;`;
    style.textContent = `:root { ${cssContent} }`;
    document.head.appendChild(style);
  }
}
