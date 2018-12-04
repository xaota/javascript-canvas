/** @section @imports */
  import {Vector} from 'javascript-algebra';

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
    strip(points) {
      points.forEach(p => this.line(p));
      return this;
    }

  /** Группа линий подряд @absolute */
    STRIP(points) {
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

  /** Прямоугольник @relative */
    rectangle(A, B) {
      return this.RECTANGLE(A.addition(this.pointer), B);
    }

  /** Прямоугольник @absolute */
    RECTANGLE(A, B) {
      this.context.rect(A.x, A.y, B.x, B.y);
      return this;
    }

  /** Многоугольник @relative */
    poly(points) {
      const head = points[0], zero = this.pointer, ring = zero.addition(head);
      return this.move(head).strip(points).LINE(ring).MOVE(zero);
    }

  /** Многоугольник @absolute */
    POLY(points) {
      const c = this.pointer, n = points.length - 1;
      return this.MOVE(points[n]).STRIP(points).MOVE(c);
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

      return this;
    }

  /** Квадратичная кривая Безье @relative */
    quadr(A, point) {

      return this;
    }

  /** Сброс параметров
    * @return {Canvas} this
    */
    reset() {
      return this.MOVE(Vector.zero);
    }

  /** Поднятие пера
    * @return {Canvas} this
    */
    end() {
      this.context.closePath();
      return this;
    }
  }
