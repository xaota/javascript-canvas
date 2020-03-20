/** @section @imports */
  import Vector from 'javascript-algebra/Vector.js';

/** {Context} Общее рисование @class */
export default class Context {
  /** */
    constructor(context) {
      this.context = context;
      this.reset();
    }

  /** Перенос пера @relative */
    move(vector) {
      return this.MOVE(this.pointer.addition(vector));
    }

  /** Перенос пера @absolute */
    MOVE(vector) {
      this.pointer = vector;
      this.context.moveTo(vector.x, vector.y);
      return this;
    }

  /** move x */
    x(shift) {
      return this.move(Vector.from(shift, 0));
    }

  /** move y */
    y(shift) {
      return this.move(Vector.from(0, shift));
    }

  /** MOVE X */
    X(coord) {
      return this.MOVE(Vector.from(coord, 0));
    }

  /** MOVE Y */
    Y(coord) {
      return this.MOVE(Vector.from(0, coord));
    }

  /** */
    to(x, y) {
      return this.move(Vector.from(x, y));
    }

  /** */
    TO(x, y) {
      return this.MOVE(Vector.from(x, y));
    }

  /** Перенос пера в угол @relative */
    nook(vertical = 'top', horisontal = 'right') {
      vertical   = vertical.toLowerCase() === 'top';
      horisontal = horisontal.toLowerCase() === 'right';
      const x =   vertical ? 0 : this._VIEW.x;
      const y = horisontal ? this._VIEW.y : 0;
      const vector = Vector.from(x, y);
      this.TO(this.coord(vector));
      if (vertical) this.flipY();
      return this;
    }

  /** Перенос пера в угол @absolute */
    NOOK(vertical = 'top', horisontal = 'right') {
      return this.reset().nook(vertical, horisontal);
    }

  /** Линия @relative */
    line(vector) {
      return this.LINE(this.pointer.addition(vector));
    }

  /** Линия @absolute */
    LINE(vector) {
      this.pointer = vector;
      this.context.lineTo(vector.x, vector.y);
      return this;
    }

  /** Группа линий подряд @relative */
    lines(...points) {
      points.forEach(p => this.line(p));
      return this;
    }

  /** Группа линий подряд @absolute */
    LINES(...points) {
      points.forEach(p => this.context.lineTo(p.data[0], p.data[1])); // fast
      if (points.length) this.pointer = points.pop();
      return this;
    }

  /** Прямоугольник из текущей позиции пера @relative */
    rect(vector) {
      const point = this.pointer;
      this.context.rect(point.x, point.y, vector.x, vector.y);
      return this;
    }

  /** Прямоугольник из текущей позиции пера @absolute */
    RECT(vector) {
      return this.rect(vector.difference(this.pointer));
    }

  /** Прямоугольник c началом относительно текущей позиции пера @relative
    * @param {Vector} A точка начала относительно пера (левый верхний угол в нормальном состоянии)
    * @param {Vector} B размеры прямоугольника
    * @return {Context} @this
    */
    offsetRect(A, B) {
      return this.rectangle(A.addition(this.pointer), B);
    }

  /** Прямоугольник @relative
    * @param {Vector} A точка начала (левый верхний угол в нормальном состоянии)
    * @param {Vector} B размеры прямоугольника
    * @return {Context} @this
    */
    rectangle(A, B) {
      this.context.rect(A.x, A.y, B.x, B.y);
      return this;
    }

  /** Прямоугольник @absolute
    * @param {Vector} A точка начала относительно пера (левый верхний угол в нормальном состоянии)
    * @param {Vector} B точка окончания (правый нижний угол в нормальном состоянии)
    * @return {Context} @this
    */
    RECTANGLE(A, B) {
      return this.rectangle(A, B.difference(A));
    }

  /** Прямоугольник с центром в точке пера @relative
    * @param {Vector} size размеры прямоугольника
    * @return {Context} @this
    */
    rectangleCenter(size) {
      const start = size.half().reverse();
      return this.rectangle(start, size);
    }

  /** Многоугольник @relative (?) */
    poly(...points) {
      const head = points[0], zero = this.pointer, ring = zero.addition(head);
      return this.move(head).lines(...points.slice(1)).LINE(ring).MOVE(zero);
    }

  /** Многоугольник @absolute */
    POLY(...points) {
      const c = this.pointer;
      return this.MOVE(points[0]).LINES(...points.slice(1)).LINE(points[0]).MOVE(c);
    }

  /** Правильный многоугольник */
    regularPoly(n, radius, rotation = 0) {
      const point = new Array(n), c = this.pointer;
      let i = 0, alpha, x, y;
      for (; i < n; ++i) {
        alpha = rotation + 2 * Math.PI * i / n;
        x = c.x + radius * Math.cos(alpha);
        y = c.y + radius * Math.sin(alpha);
        point[i] = Vector.from(x, y);
      }
      return this.POLY(point);
    }

  /** Правильный треугольник */
    regularTriangle(radius, rotation) {
      return this.regularPoly(3, radius, rotation);
    }

  /** Квадрат */
    square(radius, rotation) {
      return this.regularPoly(4, radius, rotation);
    }

  /** Дуга @relative */
    arc(radius, startAngle, endAngle, anticlockwise) {
      return this.ARC(radius, startAngle, startAngle + endAngle, anticlockwise);
    }

  /** Дуга @absolute */
    ARC(radius, startAngle, endAngle, anticlockwise = true) {
      const point = this.pointer;
      this.context.arc(point.x, point.y, radius, startAngle, endAngle, anticlockwise);
      return this;
    }

  /** Угловая дуга @relative */
    arcTo(A, B, radius) {

      return this;
    }

  /** Угловая дуга @absolute */
    ARCTO(A, B, radius) {

      return this;
    }

  /** Сглаживание угла @relative */
    corner(angle, point, radius) {

    }

  /** Сглаживание угла @absolute */
    CORNER(angle, point, radius) {

    }

  /** Эллипс */
    ellipse(a, b, rotation = 0) {
      const point = this.pointer;
      this.context.moveTo(point.x + a * Math.cos(rotation), point.y + b * Math.sin(rotation));
      this.context.ellipse(point.x, point.y, a, b, rotation, 0, Math.PI * 2);
      this.context.moveTo(point.x, point.y);
      return this;
    }

  /** Круг */
    circle(r) {
      return this.ellipse(r, r);
    }

  /** Кубическая кривая Безье @relative */
    cubic(A, B, point) {
      A = this.pointer.addition(A);
      B = this.pointer.addition(A);
      point = this.pointer.addition(point);
      return this.CUBIC(A, B, point)
    }

  /** Кубическая кривая Безье @relative */
    CUBIC(A, B, point) {
      this.context.bezierCurveTo(A.x, A.y, B.x, B.y, point.x, point.y);
      this.pointer = point;
      return this;
    }

  /** Квадратичная кривая Безье @relative */
    quadr(A, point) {
      A = this.pointer.addition(A);
      point = this.pointer.addition(point);
      return this.QUADR(A, point);
    }

  /** */
    QUADR(A, point) {
      this.context.quadraticCurveTo(A.x, A.y, point.x, point.y);
      this.pointer = point;
      return this;
    }

  /** Сброс параметров
    * @return {Canvas} this
    */
    reset() {
      return this.zero();
    }

  /** Поднятие пера
    * @return {Canvas} this
    */
    end() {
      this.context.closePath();
      return this;
    }

  /** Возврат к нулевой точке
    * @return {Canvas} this
    */
    zero() {
      return this.MOVE(Vector.zero);
    }
  }
