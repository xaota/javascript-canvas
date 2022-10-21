import Vector from 'javascript-algebra/source/vector.js';

/** {Context} Общее рисование @class */
  export default class Context {
  /** @type {CanvasRenderingContext2D} */
    #context;

  /** @type {Vector} */
    #pointer = Vector.zero;

  /** Создание контекста рисования @constructor
    * @param {CanvasRenderingContext2D} context контекст рисования
    */
    constructor(context) {
      this.#context = context;
      this.reset();
    }

  /** Контекст рисования браузера / context
    * @return {CanvasRenderingContext2D} this.#context
    */
    get context() {
      return this.#context;
    }

  /** Положение пера / pointer
    * @return {Vector} абсолютное положение пера на канвасе
    */
    get pointer() {
      return this.#pointer;
    }

  /** @section Перемещение пера */
  /** Перемещение пера / to
    * @param {Vector} vector Относительные координаты переноса
    * @return {Context} this
    */
    to(vector) {
      return this.TO(this.#pointer.addition(vector));
    }

  /** Перемещение пера / TO @absolute
    * @param {Vector} vector Абсолютные координаты переноса
    * @return {Context} this
    */
    TO(vector) {
      this.#pointer = vector;
      this.#context.moveTo(vector.x, vector.y);
      return this;
    }

  /** to x
    * @param {number} offset перемещение по X
    * @return {Context} this
    */
    x(offset) {
      return this.to(Vector.v2(offset, 0));
    }

  /** to y
    * @param {number} offset перемещение по Y
    * @return {Context} this
    */
    y(offset) {
      return this.to(Vector.v2(0, offset));
    }

  /** MOVE X
    * @param {number} coordinate новое положение по X
    * @return {Context} this
    */
    X(coordinate) {
      return this.TO(Vector.v2(coordinate, this.#pointer.y));
    }

  /** MOVE Y
    * @param {number} coordinate новое положение по Y
    * @return {Context} this
    */
    Y(coordinate) {
      return this.TO(Vector.v2(this.#pointer.x, coordinate));
    }

  /** / move
    * @param {number} x перемещение по X
    * @param {number} y перемещение по Y
    * @return {Context} this
    */
    move(x, y) {
      return this.to(Vector.v2(x, y));
    }

  /** / MOVE
    * @param {number} x новое положение по X
    * @param {number} y новое положение по Y
    * @return {Context} this
    */
    MOVE(x, y) {
      return this.TO(Vector.from(x, y));
    }

  /** Рисование линии / line
    * @param {Vector} vector Относительные координаты конца линии
    * @return {Context} this
    */
    line(vector) {
      return this.LINE(this.#pointer.addition(vector));
    }

  /** Рисование линии / LINE @absolute
    * @param {Vector} vector Абсолютные координаты конца линии
    * @return {Context} this
    */
    LINE(vector) {
      this.#pointer = vector;
      this.#context.lineTo(vector.x, vector.y);
      return this;
    }

  /** Группа линий подряд / lines
    * @param {Array<Vector>} points точки, через которые проходит линия
    * @return {Context} this
    */
    lines(points = []) {
      points.forEach(p => this.line(p));
      return this;
    }

  /** Группа линий подряд / LINES @absolute
    * @param {Array<Vector>} points точки, через которые проходит линия
    * @return {Context} this
    */
    LINES(points = []) {
      points.forEach(p => this.#context.lineTo(p.x, p.y)); // fast
      if (points.length > 0) this.#pointer = points[points.length - 1].xy;
      return this;
    }

  /** Прямоугольник с углом в текущей позиции пера / rect @relative
    * @param {Vector} vector координаты правого нижнего угла прямоугольника
    * @return {Context} this
    */
    rect(vector) {
      const point = this.#pointer;
      this.#context.rect(point.x, point.y, vector.x, vector.y);
      return this;
    }

  /** Прямоугольник с углом в текущей позиции пера / rect @absolute
    * @param {Vector} vector координаты правого нижнего угла прямоугольника
    * @return {Context} this
    */
    RECT(vector) {
      return this.rect(vector.difference(this.#pointer));
    }

  /** Прямоугольник / rectangle @relative
    * @param {Vector} start точка начала относительно пера (левый верхний угол в нормальном состоянии)
    * @param {Vector} size размеры прямоугольника
    * @return {Context} this
    */
    rectangle(start, size) {
      const point = this.#pointer.addition(start);
      this.context.rect(point.x, point.y, size.x, size.y);
      return this;
    }

  /** Прямоугольник / RECTANGLE @absolute
    * @param {Vector} start точка начала прямоугольника (левый верхний угол в нормальном состоянии)
    * @param {Vector} size размеры прямоугольника
    * @return {Context} this
    */
    RECTANGLE(start, size) {
      this.context.rect(start.x, start.y, size.x, size.y);
      return this;
    }

  /** Прямоугольник по двум точкам / rectangle2 @relative
    * @param {Vector} A начальная точка
    * @param {Vector} B конечная точка
    * @return {Context} this
    */
    rectangle2(A, B) {
      const from = this.#pointer.addition(A);
      const to   = this.#pointer.addition(B);
      return this.RECTANGLE2(from, to);
    }

  /** Прямоугольник по двум точкам / RECTANGLE2 @absolute
    * @param {Vector} A начальная точка
    * @param {Vector} B конечная точка
    * @return {Context} this
    */
    RECTANGLE2(A, B) {
      this.context.rect(A.x, A.y, B.x, B.y);
      return this;
    }

  /** Прямоугольник с центром в точке пера / rectCenter @relative
    * @param {Vector} size размеры прямоугольника
    * @return {Context} this
    */
    rectangleCenter(size) {
      const start = this.#pointer.difference(size.half);
      this.#context.rect(start.x, start.y, size.x, size.y);
      return this;
    }

  /** Квадрат с углом относительно текущей позиции пера / square @relative
    * @param {number} edge длина стороны
    * @param {Vector} offset координаты "левого верхнего" угла квадрата
    * @return {Context} this
    */
    square(edge = 1, offset = Vector.zero) {
      return this.rectangle(offset, Vector.v2(edge, edge));
    }

  /** Квадрат с углом в заданной точке / SQUARE @absolute
    * @param {number} edge длина стороны
    * @param {Vector} point координаты  "левого верхнего" угла квадрата
    * @return {Context} this
    */
    SQUARE(edge = 1, point = Vector.zero) {
      return this.RECTANGLE(point, Vector.v2(edge, edge));
    }

  /** Квадрат с центром в позиции пера / squareCenter
    * @param {number} edge длина стороны
    * @return {Context} this
    */
    squareCenter(edge = 1) {
      return this.rectangleCenter(Vector.v2(edge, edge));
    }

  /** Многоугольник не из позиции пера / polygone @relative
    * @param {Array<Vector>} points точки
    * @return {Context} this
    */
    polygone(points) {
      const zero = this.#pointer.xy;
      const head = points[0];
      const ring = zero.addition(head);
      return this.to(head).lines(points.slice(1)).LINE(ring).TO(zero);
    }

  /** Многоугольник не из позиции пера / POLYGONE @absolute
    * @param {Array<Vector>} points точки
    * @return {Context} this
    */
    POLYGONE(points) {
      const zero = this.#pointer.xy;
      const head = points[0];
      return this.TO(head).LINES(points.slice(1)).LINE(head).TO(zero);
    }

  /** Многоугольник с углом в позиции пера / poly @relative
    * @param {Array<Vector>} points точки
    * @return {Context} this
    */
    poly(points) {
      const zero = this.#pointer.xy;
      return this.lines(points).LINE(zero);
    }

  /** Многоугольник с углом в позиции пера / POLYGONE @absolute
    * @param {Array<Vector>} points точки
    * @return {Context} this
    */
    POLY(points) {
      const zero = this.#pointer.xy;
      return this.LINES(points).LINE(zero);
    }

  /** Правильный многоугольник (перо в центре) / regularPoly
    * @param {number} n количество углов, n: unsigned integer > 2
    * @param {number} radius радиус описанной окружности
    * @param {number} rotation угол изначального поворота многоугольника (в радианах)
    * @return {Context} this
    */
    regularPoly(n, radius, rotation = 0) {
      const points = new Array(n);
      const zero = this.#pointer;
      for (let i = 0; i < n; ++i) {
        const alpha = rotation + 2 * Math.PI * i / n;
        const x = zero.x + radius * Math.cos(alpha);
        const y = zero.y + radius * Math.sin(alpha);
        points[i] = Vector.from(x, y);
      }
      return this.POLYGONE(points);
    }

  /** Правильный треугольник (перо в центре) / regularTriangle
    * @param {number} radius радиус описанной окружности
    * @param {number} rotation угол изначального поворота многоугольника (в радианах)
    * @return {Context} this
    */
    regularTriangle(radius, rotation = 0) {
      return this.regularPoly(3, radius, rotation);
    }

  /** Квадрат (перо в центре) / regularSquare
    * @param {number} radius радиус описанной окружности
    * @param {number} rotation угол изначального поворота многоугольника (в радианах)
    * @return {Context} this
    */
    regularSquare(radius, rotation = 0) {
      return this.regularPoly(4, radius, rotation);
    }

  /** Рисование линий откладыванием сторон на угол (циркулем и линейкой) / сonstructСlassic
    * @param {number} count количество линий
    * @param {number} side длина стороны
    * @param {number} [factor=2] уровень цикличности (2 - окружность)
    * @param {number} [rotation=0] угол изначального поворота в радианах
    * @return {Context} this
    */
    сonstructСlassic(count, side, factor = 2, rotation = 0) {
      const phi = factor * 2 * Math.PI / count;
      let current = Vector.zero;
      /** @type {Array<Vector>} */
      const points = [];
      let angle = phi + rotation;
      for (let i = 0; i <= count; ++i) {
        const point = Vector.polar(side, angle);
        points.push(current.addition(point));
        current = point;
        angle += phi;
      }
      return this.lines(points.slice(1));
    }

  /** Рисование эллипсов / ellipse
    * @param {Vector} radiuses {x, y} радиусы эллипса
    * @param {number} [rotation=0] угол изначального поворота в радианах
    * @return {Context} this
    */
    ellipse(radiuses, rotation = 0) {
      const { x, y } = this.#pointer.xy.object;
      const { x: a, y: b } = radiuses.xy.object;
      this.context.moveTo(x + a * Math.cos(rotation), y + b * Math.sin(rotation));
      this.context.ellipse(x, y, a, b, rotation, 0, Math.PI * 2);
      this.context.moveTo(x, y);
      return this;
    }

  /** Рисование окружности / circle
    * @param {number} radius радиус
    * @return {Context} this
    */
    circle(radius) {
      return this.ellipse(Vector.v2(radius, radius));
    }

  // /** Звезда (перо в центре) / star
  //   * @param {number} n количество лучей, n: unsigned integer > 2
  //   * @param {Array<Vector>} radiuses радиусы точек в лучах и относительные углы сегментов луча
  //   * @param {number} angle угол изначального поворота звезды (в радианах)
  //   * @return {Context} this
  //   */
  //   star(n, radiuses = [], angles = [], rotation = 0) {
  //     const points = new Array(radiuses.length * n);
  //     return this.POLYGONE(points);
  //   }

  /** @section Дополнительные методы */
  /** Рисование прямоугольной сетки из текущего положения пера / grid
    * @param {Vector} dimension {x, y} количество клеток по ширине и высоте
    * @param {Vector} size {x, y} размеры сетки
    * @param {boolean} bordered рисование внешних границ
    * @TODO: GRID, grid2, GRID2, gridCenter, gridSquare, gridSquareCenter
    * @return {Context} this
    */
    grid(dimension, size, bordered = false) {
      if (bordered) this.rect(size);

      const origin = this.#pointer.xy;
      const x = size.x / dimension.x;
      const y = size.y / dimension.y;
      const w = Vector.v2(size.x, 0);
      const h = Vector.v2(0, size.y);

      for (let i = 1; i < dimension.x; ++i) {
        this.x(x * i).line(h).TO(origin);
      }
      for (let i = 1; i < dimension.y; ++i) {
        this.y(y * i).line(w).TO(origin);
      }

      return this;
    }

  /** Сброс параметров / reset
    * @return {Context} this
    */
    reset() {
      return this.zero();
    }

  /** Возврат к нулевой точке / zero
    * @return {Context} this
    */
    zero() {
      return this.TO(Vector.zero);
    }

  /** Поднятие пера
    * @return {Context} this
    */
    end() {
      this.#context.closePath();
      return this;
    }
  }
