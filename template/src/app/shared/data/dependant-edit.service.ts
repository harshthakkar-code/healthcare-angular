import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DependantEditService {
  private dependantSource = new BehaviorSubject<any>(null);
  dependant$ = this.dependantSource.asObservable();

  setDependant(dep: any) {
    this.dependantSource.next(dep);
    console.log(dep)
  }
} 