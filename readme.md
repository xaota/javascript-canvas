Рисование для Canvas API [es6+] @2d

### Использование
```html
<body>
  <canvas></canvas>
</body>
```

```javascript
import {Canvas, Path} from '/javascript-canvas/index.js';
import {Vector}       from '/javascript-algebra/index.js';

const canvas = document.querySelector('canvas');

const context = new Canvas(canvas);
const size    = Vector.from(width, height); // размеры холста

const pointA = Vector.from(x, y); // координаты точек
const pointB = Vector.from(w, h);

context.port(size)
  .begin()
    .style({stroke: 'red', fill: 'lime'})
    .move(pointA)
    .rect(pointB)
    .fill()
    .stroke()
  .end();
```

### Фича
> аналогично SVG, различия между lowercase и UPPERCASE методами в относительном или абсолютном смещении при рисовании

_пример_: рисуем одну и ту же линию двумя способами
```javascript
        // относительные значения
context // линия будет нарисована от (100,100) до (200,200)
  .begin()
    .move(Vector.from(100, 100)) // координаты начальной точки
    .line(Vector.from(100, 100)) // смещаемся на (100,100) от предыдущей точки
    .stroke()
  .end();

        // абсолютные значения
context // линия будет нарисована от (100,100) до (200,200)
  .begin()
    .MOVE(Vector.from(100, 100)) // координаты начальной точки
    .LINE(Vector.from(200, 200)) // координаты конечной точки
    .stroke()
  .end();
```

### Алгебраические преобразования (2D)
> можно для удобства преобразовывать контекст рисования и восстанавливать его обратно

_пример_: нарисуем квадрат, повернутый на 45 градусов и потом еще один внутри
```javascript
const size   = Vector.from(50, 50);   // размеры квадрата
const center = Vector.from(100, 100); // центр квадрата будет в этой точке

context
  .begin()
    .save()                           // сохраняем СК (0 -> 1)
      .translate(center)              // перенос начала координат в точку (100, 100)
      .rotate(Math.PI / 4)            // поворот на 45 градусов
      .rectangleCenter(size)
        .save()                       // сохраняем СК (1 -> 2)
          .rotate(Math.PI / 4)        // поворот на 45 градусов
          .rectangleCenter(size)
        .restore()                    // восстанавливаем СК (2 -> 1)
      .restore();                     // восстанавливаем СК (1 -> 0)
    .stroke()                         // рисование
  .end()
```

### Примечания
