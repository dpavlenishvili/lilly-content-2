import { A11yModule } from '@angular/cdk/a11y';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';

export interface SortControl {
  name: string;
  value: string;
  slug?: string;
}

@Component({
  selector: 'lilly-sorting',
  templateUrl: './sorting.component.html',
  styleUrls: ['./sorting.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SortingComponent),
    multi: true
  }],
  imports: [
    MatFormField,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    MatPrefix,
    A11yModule
  ],
  standalone: true
})
export class SortingComponent implements ControlValueAccessor {
  @Input() options: SortControl[];

  control = new UntypedFormControl();

  onChange: (value?: string) => void = () =>  {};

  writeValue(value: SortControl) {
    this.control.setValue(value);
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched() {}
}
