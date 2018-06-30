Рисование для Canvas API [es6] @2d

### Использование
```javascript
import {Canvas, Path} from 'javascript-canvas';
import {Vector}       from 'javascript-algebra';

const context   = new Canvas(canvas);
const size      = Vector.from(width, height);

const pointFrom = Vector.from(x, y);
const pointTo   = Vector.from(w, h);

context.port(size)
  .begin()
    .style({stroke: 'red', fill: '#lime'})
    .move(pointFrom)
    .rect(pointTo)
    .fill().stroke()
  .end();
```
