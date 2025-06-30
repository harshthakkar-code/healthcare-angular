import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {

 public base: BehaviorSubject<string> = new BehaviorSubject<string>('');
 public page: BehaviorSubject<string> = new BehaviorSubject<string>('');
 public last: BehaviorSubject<string> = new BehaviorSubject<string>('');



}