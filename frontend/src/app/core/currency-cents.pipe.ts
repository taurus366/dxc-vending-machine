import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'euroCents' })
export class CurrencyCentsPipe implements PipeTransform {
  transform(cents: number | null | undefined): string {
    const value = ((cents ?? 0) / 100).toFixed(2);
    return `€${value}`;
  }
}
