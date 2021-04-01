import { 
  Directive,
  OnInit,
  HostListener,
  HostBinding,
  Input 
} from '@angular/core';

@Directive({
  selector: '[appRowHighlight]'
})
export class RowHighlightDirective implements OnInit{

  @Input() defaultColor: string = 'transparent';
  @Input('appRowHighlight') highlightColor: string = 'rgb(245, 245, 245)';
  @Input() row;
  @HostBinding('style.backgroundColor') backgroundColor: string;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('mouseenter') mouseover(eventData: Event) {
    this.backgroundColor = this.highlightColor;
  }

  @HostListener('mouseleave') mouseleave(eventData: Event) {
    this.backgroundColor = this.row.modified? 'rgb(228, 255, 185)' : this.defaultColor;
  }

  //hack to fix child modified rows that do not highlight
  // when the parent row is marked for deletion
  @HostListener('document:click') click(eventData: Event) {
    this.backgroundColor = this.row.modified? 'rgb(228, 255, 185)' : this.defaultColor;
  }


}
