import { 
  Directive,
  OnInit,
  ElementRef,
  Input,
  Renderer2,
  HostListener
 } from '@angular/core';

@Directive({
  selector: '[appResizeInput]'
})
export class ResizeInputDirective implements OnInit{

  @Input('appResizeInput') inputText: string;

  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    // if(this.inputText != null && this.inputText !== 'null'){
      this.renderer.setStyle(this.elRef.nativeElement, 'width', (this.inputText.length + 1.45) + "ch");
    // }else{
    //   this.renderer.setStyle(this.elRef.nativeElement, 'width', 1.45 + "ch");
    // }
  }

  @HostListener('input', ['$event.target.value']) input(inputValue) {
    this.renderer.setStyle(this.elRef.nativeElement, 'width', (inputValue.length + 1.45) + "ch");
  }

  //this 'change'  host listener is used by
  // the revertInputSize() function so that it doesn't use
  // the 'input' event which has other downstream effects
  @HostListener('change', ['$event.target.value']) change(inputValue) {
    this.renderer.setStyle(this.elRef.nativeElement, 'width', (inputValue.length + 1.45) + "ch");
  }

}
