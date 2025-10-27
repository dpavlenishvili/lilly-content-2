# cb-card (Angular 17+)

A lean Material-like card with header/body/footer slots you can repeat or omit entirely.
All styling uses CSS variables prefixed with `--cb-card--`. Main class is `cb-card`.

## Files
- `src/app/shared/card/card.component.ts|html|scss`
- `src/app/shared/card/card-header.directive.ts`
- `src/app/shared/card/card-body.directive.ts`
- `src/app/shared/card/card-footer.directive.ts`
- `src/app/shared/card/card.module.ts`
- `src/app/shared/card/index.ts`
- `src/app/demo/demo-page.component.ts` (usage example)

## Install
Copy `src/app/shared/card` into your project. Then:
```ts
import { CbCardModule } from '.../shared/card/card.module';

@Component({
  standalone: true,
  imports: [CbCardModule],
  /* ... */
})
export class AnyComponent {}
```

## Use
```html
<cb-card>content</cb-card>

<cb-card>
  <cb-card-header>Title</cb-card-header>
  <cb-card-body>Block A</cb-card-body>
  <cb-card-body>Block B</cb-card-body>
  <cb-card-footer>Actions</cb-card-footer>
</cb-card>
```

## CSS Variables
Override globally or per instance.

- `--cb-card--bg`
- `--cb-card--fg`
- `--cb-card--radius`
- `--cb-card--border-color`
- `--cb-card--border-width`
- `--cb-card--shadow`
- `--cb-card--padding-x`
- `--cb-card--padding-y`
- `--cb-card--section-gap`
- `--cb-card--header-bg`
- `--cb-card--header-border-color`
- `--cb-card--header-border-width`
- `--cb-card--footer-bg`
- `--cb-card--footer-border-color`
- `--cb-card--footer-border-width`
