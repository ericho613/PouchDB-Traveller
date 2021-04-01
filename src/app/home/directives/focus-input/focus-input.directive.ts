import { 
  Directive,
  OnInit,
  ElementRef,
  Input
 } from '@angular/core';

@Directive({
  selector: '[appFocusInput]'
})
export class FocusInputDirective implements OnInit {

  @Input('appFocusInput') selectedFieldId: string;
  @Input() elementLocation: string;
  @Input() elementValue: string;

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    
    if(this.elementLocation === this.selectedFieldId){

      setTimeout(()=>{
        this.elRef.nativeElement.focus();
      }, 100);
      
    }
  }

}
