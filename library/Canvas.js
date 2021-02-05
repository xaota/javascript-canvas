import {Vector, Matrix} from 'javascript-algebra';
import Context          from './Context.js';

/** {Canvas} Рисование на холсте @export @class @default */
  export default class Canvas extends Context {
  /** @constructor
    * @param {HTMLCanvasElement} canvas холст для рисования
    */
    constructor(canvas = document.createElement('canvas')) {
      super(canvas.getContext('2d'));
      this.canvas = canvas;
      this.decore = {};
      this.reset();
    }

  /** */
    get SIZE() {
      return this._SIZE;
    }

  /** */
    get VIEW() {
      // let vector = [
      //   this.context.canvas.width,
      //   this.context.canvas.height
      // ];
      // return new Vector(vector.map(Number));
      return this._VIEW;
    }

  /** */
    get PORT() {
      return {
        size: this.SIZE,
        view: this.VIEW
      }
    }

  /** */
    get HARD() {
      return this.VIEW.multiplication(this.SIZE.link());
    }

  /** */
    get CENTER() {
      return this.VIEW.scale(0.5);
    }

  /** Положение пера относительно правого нижнего угла холста @readonly
    * @return {Vector} точка на холсте
    */
    get POINT() {
      return this.VIEW.difference(this.pointer);
    }

  /** Изменение размеров холста / size
    * @param {Vector} vector новые размеры холста
    * @return {Canvas} @this
    */
    size(vector) {
      this.canvas.style.width  = vector.x + 'px';
      this.canvas.style.height = vector.y + 'px';
      this._SIZE = vector;
      return this;
    }

  /** / view
    * @param {Vector} vector новые размеры холста
    * @return {Canvas} @this
    */
    view(vector) {
      this.context.canvas.width  = vector.x;
      this.context.canvas.height = vector.y;
      this._VIEW = vector;
      return this;
    }

  /** Установка размеров холста и области рисования / port
    * @param {Vector} vector устанавливаемые размеры
    * @return {Canvas} this
    */
    port(vector) {
      return this.size(vector).view(vector);
    }

  /** / hard */
    hard(vector) {
      return this.view(this.SIZE.multiplication(vector));
    }

  /** Перевод абсолютных координат в координаты окружения пера / coord */
    coord(vector) { // AX = B => X = inverse(A) B
      return this.matrix.transitionInverse(vector.resize(3).fill(2, 1)).resize(2);
    }

  /** Перевод координат из окружения пера в абсолютные (?) / origin */
    origin(vector) { // AB = X
      return this.matrix.transition(vector.resize(3).fill(2, 1)).resize(2);
    }

  /** Перевод точек из одной СК окружения пера в другую через матрицу перехода / transition @static */
    static transition(matrix, vector) {
      return Matrix.transition(matrix, vector.resize(3).fill(2, 1)).resize(2);
    }

  /** Преобразование СК с переносом пера / transition */
    transition(matrix) {
      this.matrix = this.matrix.multiply(matrix);
      // this.pointer = Canvas.transition(matrix, this.pointer);
      return this;
    }

  /** Перенос начала координат в центр холста / center @relative
    * @return {Canvas} @this
    */
    center() {
      return this.TO(this.CENTER);
    }

  /** Перенос начала координат в центр холста / basis @absolute
    * @return {Canvas} this
    */
    basis() {
      return this.reset().center();
    }

  /** Переход к новому базису
    * @param {Matrix} matrix новый базис
    * @return {Canvas} @this
    */
    BASIS(matrix) {
      const A = matrix.col(0), B = matrix.col(1);
      return this.transform(A.x, B.x, A.y, B.y, 1, 1);
    }

  /** Помещение пера на холст
    * @return {Canvas} this
    */
    begin() {
      this.context.beginPath();
      return this;
    }

  /** Сохранение текущего состояния холста
    * @return {Canvas} this
    */
    save() {
      this.context.save();
      this.stack.push({
        matrix: this.matrix,
        locate: this.pointer
      });
      return this;
    }

  /** Возврат к предыдущему состоянию холста
    * @return {Canvas} this
    */
    restore() {
      this.context.restore();
      const last = this.stack.pop();
      this.pointer = last.locate;
      this.matrix  = last.matrix;
      return this;
    }

  /** Изменение стиля рисования */
    style(param) {
      for (const i in param) if (param[i]) this.context[i in dictionary ? dictionary[i] : i] = param[i];
      Object.assign(this.decore, param);
      return this;
    }

  /** Работа с тенями */
    shadow(color, {x = 0, y = 0, blur = 0}) {
      this.context.shadowOffsetX = x;
      this.context.shadowOffsetY = y;
      this.context.shadowBlur    = blur;
      this.context.shadowColor   = color;
      return this;
    }

  /** Рисование контура / stroke
    * @return {Canvas} @this
    */
    stroke() {
      this.context.stroke();
      return this;
    }

  /** */
    STROKE(color) {
      var last = this.decore.stroke;
      return this.style({stroke: color}).stroke().style({stroke: last});
    }

  /** */
    strokePath(path) {
      this.context.stroke(path.context);
      return this;
    }

  /** */
    STROKEPATH(path, color) {
      var last = this.decore.stroke;
      return this.style({stroke: color}).strokePath(path).style({stroke: last});
    }

  /** Заливка
    * @return {Canvas} @this
    */
    fill() {
      this.context.fill();
      return this;
    }

  /** */
    FILL(color) {
      var last = this.decore.fill;
      return this.style({fill: color}).fill().style({fill: last});
    }

  /** */
    fillPath(path) {
      this.context.fill(path.context);
      return this;
    }

  /** */
    FILLPATH(path, color) {
      var last = this.decore.fill;
      return this.style({fill: color}).fillPath(path).style({fill: last});
    }

  /** Заливка цветом ВСЕГО холста / fillCanvas
    * @param {string} fill цвет заливки
    * @return {Canvas} @this
    */
    fillCanvas(fill) {
      const A = this.coord(Vector.zero);
      const B = this.coord(this.SIZE);
      this.save().begin()
        .MOVE(A).RECT(B)
        .style({fill}).fill()
        .end().restore();
      return this;
    }

  /** Изображение @relative */
    image(image, options) {
      options = {...defaultDrawImageOptions(image), ...options};
      options.point = this.pointer.addition(options.point);
      return this.IMAGE(image, options);
    }

  /** */
    imageCenter(image, options) {
      options = {...defaultDrawImageOptions(image), ...options};
      options.point = this.pointer;
      return this.IMAGECENTER(image, options);
    }

  /** */
    strip(images, point, next) {
      images.forEach(image => {
        this.image(image, {point});
        point = next(point, Vector.from(image.width, image.height));
      });
      return this;
    }

  /** */
    stripHorizontal(images, point = Vector.zero) {
      const next = (point, size) => point.addition(Vector.from(size.x, 0));
      return this.strip(images, point, next);
    }

  /** */
    stripVertical(images, point = Vector.zero) {
      const next = (point, size) => point.addition(Vector.from(0, size.y));
      return this.strip(images, point, next);
    }

  /** */
    tiles(map, step, point = Vector.zero) {
      const position = point.copy();
      map.forEach(line => {
        this.stripHorizontal(line, position);
        position.y += step;
      });
      return this;
    }

  /** Рисование изображения @absolute
    * @param {Image} image рисуемое изображение
    * @param {Vector} point стартовая точка холста-приемника
    * @param {Vector} offset верхний левый угол фрагмента, который будет вырезан из изображения-источника
    * @param {Vector} size размеры рисуемого изображения (масштабирование)
    * @param {Vector} region размер фрагмента, который будет вырезан из изображения источника (либо до правого нижнего угла)
    * @return {Context} this
    */
    IMAGE(image, {
        point  = Vector.zero,
        offset = Vector.zero,
        size   = Vector.from(image.width, image.height),
        region = Vector.from(image.width, image.height)
      }) {
        this.context.drawImage(image, offset.x, offset.y, region.x, region.y, point.x, point.y, size.x, size.y);
        return this;
    }

  /** */
    IMAGECENTER(image, options) {
      options = {...defaultDrawImageOptions(image), ...options};
      options.point = options.point.addition(options.size.reverse().scale(0.5));
      return this.IMAGE(image, options);
    }

  /** */
    STRIP(images, point, next) {
      images.forEach(image => {
        this.IMAGE(image, {point});
        point = next(point, Vector.from(image.width, image.height));
      });
      return this;
    }

  /** */
    STRIPHORIZONTAL(images, point = Vector.zero) {
      const next = (point, size) => point.addition(Vector.from(size.x, 0));
      return this.STRIP(images, point, next);
    }

  /** */
    STRIPVERTICAL(images, point = Vector.zero) {
      const next = (point, size) => point.addition(Vector.from(0, size.y));
      return this.STRIP(images, point, next);
    }

  /** */
    TILES(map, step, point = Vector.zero) {
      const position = point.copy();
      map.forEach(line => {
        this.STRIPHORIZONTAL(line, position);
        position.y += step;
      });
      return this;
    }

  /** Пиксельные данные объекта холста @relative
    * @param {Vector} [size=Vector.zero] размеры области
    * @param {Vector} [offset=Vector.zero] отступ области
    * @return {ImageData} данные
    */
    pixels(size = this.POINT, offset = Vector.zero) {
      const point = this.pointer.addition(offset);
      return this.PIXELS(size, point);
    }

  /** Пиксельные данные объекта холста @absolute
    * @param {Vector} [size=Vector.zero] размеры области
    * @param {Vector} [point=Vector.zero] отступ области
    * @return {ImageData} данные
    */
    PIXELS(size = this.VIEW, point = Vector.zero) {
      return this.context.getImageData(point.x, point.y, size.x, size.y);
    }

  /** Ограничение области рисования @relative / clip
    * @param {"evenodd" | "nonzero"} [rule="nonzero"] алгоритм выбора положения точки в регионе рисования (nonzero / evenodd)
    * @return {Canvas} @this
    */
    clip(rule = 'nonzero') {
      this.context.clip(rule);
      return this;
    }

  /** Ограничение области рисования по пути @absolute / CLIP
    * @param {Path|Path2D} path регион ограничения области рисования
    * @param {string} [rule="nonzero"] алгоритм выбора положения точки в регионе рисования (nonzero / evenodd)
    * @return {Canvas} @this
    */
    CLIP(path, rule = 'nonzero') {
      this.context.clip(path.context, rule);
      return this;
    }

  /** Очистка области экрана @absolute / clr
    * @param {Vector} A координаты точки, из которой делать очистку
    * @param {Vector} B координаты точки, до которой делать очистку
    * @return {Canvas} @this
    */
    clr(A, B) {
      this.context.clearRect(A.x, A.y, B.x, B.y);
      return this;
    }

  /** Очистка области экрана @relative / clear
    * @param {Vector} vector координаты точки, до которой делать очистку
    * @return {Canvas} @this
    */
    clear(vector) {
      return this.clr(this.pointer, vector);
    }

  /** Очистка всего холста / CLEAR
    * @return {Canvas} @this
    */
    CLEAR() {
      const A = this.coord(Vector.zero);
      const B = this.VIEW;
      return this.clr(A, B);
    }

  /** Перенос центра координат @relative */
    translate(vector) {
      return this.TRANSLATE(this.pointer.addition(vector));
    }

  /** Перенос центра координат @absolute */
    TRANSLATE(vector) {
      const matrix = Matrix.translate(vector);
      this.transition(matrix).context.translate(vector.x, vector.y);
      return this;
    }

  /** Вектор координат переноса */
    get translateVector() {
      // this.matrix.col(2).resize(2)
      return new Vector(this.matrix.element(6, 2));
    }

  /** Масштабирование @relative */
    scale(vector) {
      const matrix = Matrix.scale(vector, 3);
      this.transition(matrix).context.scale(vector.x, vector.y);
      return this;
    }

  /** Масштабирование @absolute */
    SCALE(vector) {
      vector = this.scaleVector.link().multiplication(vector);
      return this.scale(vector);
    }

  /** Равномерное масштабирование @relative */
    zoom(value) {
      return this.scale(Vector.from(value, value));
    }

  /** Равномерное масштабирование @absolute */
    ZOOM(value) {
      return this.SCALE(Vector.from(value, value));
    }

  /** Перевороты
    * @return {Canvas} @this
    */
    flipX() { // горизонталь
      return this.scale(Vector.flipX);
    }

  /**
    * @return {Canvas} this
    */
    flipY() { // вертикаль
      return this.scale(Vector.flipY);
    }

  /** Вектор коэффициентов масштабирования */
    get scaleVector() {
      return this.matrix.diagonal().resize(2);
    }

  /** Искажение @relative */
    skew(vector) {
      const m = Matrix.skew(vector, 3).data;
      return this.transform(m[0], m[1], m[3], m[4], m[6], m[7]);
    }

  /** Искажение @absolute */
    SKEW(vector) {
      const m = this.matrix.data;
      return this.TRANSFORM(m[0], vector.x, vector.y, m[4], m[6], m[7]);
    }

  /** Вектор коэффициентов искажения
    * @return {Canvas} this
    */
    get skewVector() {
      const x = this.matrix.get(1, 0),
            y = this.matrix.get(0, 1);
      return Vector.from(x, y);
    }

  /** Поворот @relative */
    rotate(angle) {
      const matrix = Matrix.rot(angle, 3);
      this.transition(matrix).context.rotate(angle);
      return this;
    }

  /** Поворот @absolute влияет на значения skew и scale */
    ROTATE(angle) {
      const m = Matrix.rot(angle, 3).fill(6, this.translateVector.data).data; // fast
      return this.TRANSFORM(m[0], m[1], m[3], m[4], m[6], m[7]);
    }

  /** Поворот вокруг точки @todo */
    rotateFrom(vector) {
      return this.rotate(Math.atan(vector.y / vector.x));
    }

  /** Матрица коэффициентов поворота */
    get rotateMatrix() {
      // let skew = this.skewVector, scale = this.scaleVector;
      // return Matrix([scale.x, skew.x, skew.y, scale.y]);
      return this.matrix.minor(2, 2);
    }

  /** Трансформация @relative */
    transform(a, b, c, d, e, f) {
      const matrix = Matrix.transform2(a, b, c, d, e, f);
      this.transition(matrix).context.transform(a, b, c, d, e, f);
      return this;
    }

  /** Трансформация @absolute */
    TRANSFORM(a, b, c, d, e, f) {
      if (!arguments.length) return this.TRANSFORM(1, 0, 0, 1, 0, 0);
      const pointer = this.origin(this.pointer), last = this.stack.length - 1;
      this.stack[last] = this.matrix = Matrix.transform2(a, b, c, d, e, f);
      this.pointer = this.coord(pointer);
      this.context.setTransform(a, b, c, d, e, f);
      return this;
    }

  /** Перенос центра координат и перевод туда пера @relative */
    to(vector) {
      return this.translate(vector).MOVE(Vector.zero);
    }

  /** Перенос центра координат и перевод туда пера @absolute */
    TO(vector) {
      return this.TRANSLATE(vector).MOVE(Vector.zero);
    }

  /** Сброс параметров холста
    * @return {Canvas} this
    */
    reset() {
      this.stack  = []; // transforms
      this.matrix = Matrix.identity(3);
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      return super.reset();
    }

  /** / init
    * @return {Canvas} this
    */
    init() {
      const width  = this.context.canvas.width;
      const height = this.context.canvas.height;
      const vector = Vector.from(width, height);
      return this.port(vector);
    }

  /** Создание и инициализация холста @static @init @fabric
    * @param {HTMLCanvasElement} canvas холст для рисования
    * @return {Canvas} this
    */
    static init(canvas) {
      return new Canvas(canvas).init();
    }

  /** Нахождение точки в нарисованной области (текущая СК) @absolute
    * @param {Vector} vector координаты точки
    * @return {Boolean} true, если точка лежит в области пути
    */
    In(vector) {
      return this.inPath(this.origin(vector));
    }

  /** Нахождение точки в нарисованной области (основная СК) @relative
    * @param {Vector} vector координаты точки
    * @return {Boolean} true, если точка лежит в области пути
    */
    in(vector) {
      return this.context.isPointInPath(vector.x, vector.y);
    }

  /** Нахождение точки в области нарисованного пути (текущая СК) @absolute */
    InPath(path, vector, rule) {
      return this.inPath(path, this.origin(vector), rule);
    }

  /** Нахождение точки в нарисованной области (основная СК) @relative */
    inPath(path, vector, rule = 'nonzero') {
      return this.context.isPointInPath(path.context, vector.x, vector.y, rule);
    }

  /** Нахождение точки в области нарисованного пути (текущая СК) @absolute */
    InStroke(vector) {
      return this.inStroke(this.origin(vector));
    }

  /** Нахождение точки в нарисованной области (основная СК) @relative */
    inStroke(vector) {
      return this.context.isPointInStroke(vector.x, vector.y);
    }

  /** Нахождение точки в области нарисованного пути (текущая СК) @absolute */
    InStrokePath(path, vector) {
      return this.inStrokePath(path, this.origin(vector));
    }

  /** Нахождение точки в нарисованной области (основная СК) @relative */
    inStrokePath(path, vector) {
      return this.context.isPointInStroke(path.context, vector.x, vector.y);
    }

  /** Радиальный градиент @relative */
    radial(radius, start, finish) {
      const P = this.pointer,
          grd = this.GrdRad(P, P, Vector.from(0, radius));
      grd.addColorStop(0, start);
      grd.addColorStop(1, finish);
      return grd;
    }

  /** */
    gradientRadial(B, R) {
      B = this.pointer.addition(B);
      return this.GrdRad(this.pointer, B, R);
    }

  /** */
    grdRad(A, B, R) {
      A = this.pointer.addition(A);
      B = this.pointer.addition(B);
      return this.GrdRad(A, B, R);
    }

  /** Радиальный градиент @absolute */
    RADIAL(point, radius, start, finish) {
      const grd = this.GrdRad(point, point, Vector.from(0, radius));
      grd.addColorStop(0, start);
      grd.addColorStop(1, finish);
      return grd;
    }

  /** */
    GradientRadial(B, R) {
      return this.GrdRad(this.pointer, B, R);
    }

  /** */
    GrdRad(A, B, R) {
      return this.context.createRadialGradient(A.x,A.y,R.x, B.x,B.y,R.y);
    }

  /** Получает ширину строки */
    measure(string) {
      return this.context.measureText(string).width;
    }

  /** Высота символа в строке @private @beta
    * @param {string} string символ
    * @param {string} font настройки шрифта
    * @return {object} размерности высоты символа {size, top, bottom, height}
    */
    measureHeightChar(string, font) {
      const c = new Canvas();
      const height = parseFloat(font) * 2;
      c.port(Vector.from(height * string.length, height));
      c.style(this.decore);
      c.style({font, base: 'bottom'});
      c.move(Vector.from(0, height / 2));
      c.fillText(string);
      const bounds = c.bounds();
      return {
        size: bounds.size.y,
        top: bounds.top, // || 0
        bottom: bounds.bottom,
        height
      };
    }

  /** Высота строки @beta
    * @param {string} string символ
    * @param {string} size настройки размера шрифта
    * @return {object} размерности высоты символа {top, bottom, height}
    */
    measureHeight(string, size) {
      if (string.length === 0) return {height: size, top:0, bottom:0};
      const font = size ? size + 'px Arial' : this.decore.font;
      const precision = Math.floor(parseFloat(font) * 0.05);
      const chars = string.split('').map((c, i) => ({...this.measureHeightChar(c, font), index: i, char: c})).filter(e => e.size > 0);

      const top    = chars.reduce((a, e) => a.some(c => Math.abs(c - e.top) <= precision) ? a : a.concat(e.top), []);
      const bottom = chars.reduce((a, e) => a.some(c => Math.abs(c - e.bottom) <= precision) ? a : a.concat(e.bottom), []);
      const height = chars.reduce((a, e) => a.some(c => Math.abs(c - e.size) <= precision) ? a : a.concat(e.size), []);
      const maximum = Math.max(...height);

      const diffBottom = Math.max(...bottom) - Math.min(...bottom);
      const diffTop = Math.max(...top) - Math.min(...top);

      return {
        height: maximum,
        bottom: diffBottom,
        top: diffTop
      };
    }

  /** Заливка текста @relative
    * @param {string} string строка текста
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    fillText(string, width) {
      return this.FILLTEXT(string, this.pointer, width);
    }

  /** */
    offsetFillText(string, point, width) {
      point = this.pointer.addition(point);
      return this.FILLTEXT(string, point, width);
    }

  /** Заливка текста @absolute */
    FILLTEXT(string, point, width) {
      this.context.fillText(string, point.x, point.y, width);
      return this;
    }

  /** Заливка текста с выравниванием по центру
    * @param {string} string строка текста
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    fillTextCenter(string, width = Infinity) {
      const measure = this.measure(string);
      width = Math.min(measure, width);
      const point = this.pointer.addition(Vector.from(-width / 2, 0));
      return this.FILLTEXT(string, point, width);
    }

  /** Заливка многострочного текста с выравниванием
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {string} align выравнивание
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    fillTextMultiline(strings, lineheight, align = 'left', width = Infinity) {
      switch (align) {
        case 'left'  : return this.fillTextMultilineLeft(  strings, lineheight, width);
        case 'right' : return this.fillTextMultilineRight( strings, lineheight, width);
        case 'center': return this.fillTextMultilineCenter(strings, lineheight, width);
        default: throw Error('выравнивание текста не установлено');
      }
    }

  /** Заливка многострочного текста с выравниванием по левому краю
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    fillTextMultilineLeft(strings, lineheight, width = Infinity) {
      strings.forEach(s => this.fillText(s, width).move(Vector.from(0, lineheight)));
      return this;
    }

  /** Заливка многострочного текста с выравниванием по правому краю
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    fillTextMultilineRight(strings, lineheight, width = Infinity) { // ! TODO:
      strings.forEach(s => this.fillText(s, width).move(Vector.from(0, lineheight)));
      return this;
    }

  /** Заливка многострочного текста с выравниванием по центру
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    fillTextMultilineCenter(strings, lineheight, width = Infinity) {
      strings.forEach(s => this.fillTextCenter(s, width).move(Vector.from(0, lineheight)));
      return this;
    }

  /** Обводка текста @relative
    * @param {string} string строка текста
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    strokeText(string, width) {
      return this.STROKETEXT(string, this.pointer, width);
    }

  /** */
    offsetStrokeText(string, point, width) {
      point = this.pointer.addition(point);
      return this.STROKETEXT(string, point, width);
    }

  /** Обводка текста @absolute */
    STROKETEXT(string, point, width) {
      this.context.strokeText(string, point.x, point.y, width);
      return this;
    }

  /** Обводка текста с выравниванием по центру
    * @param {string} string строка текста
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    strokeTextCenter(string, width = Infinity) {
      const measure = this.measure(string);
      width = Math.min(measure, width);
      const point = this.pointer.addition(Vector.from(-width / 2, 0));
      return this.STROKETEXT(string, point, width);
    }

  /** Обводка многострочного текста с выравниванием
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {string} align выравнивание
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    strokeTextMultiline(strings, lineheight, align = 'left', width = Infinity) {
      switch (align) {
        case 'left'  : return this.strokeTextMultilineLeft(  strings, lineheight, width);
        case 'right' : return this.strokeTextMultilineRight( strings, lineheight, width);
        case 'center': return this.strokeTextMultilineCenter(strings, lineheight, width);
        default: throw Error('выравнивание текста не установлено');
      }
    }

  /** Обводка многострочного текста с выравниванием по левому краю
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    strokeTextMultilineLeft(strings, lineheight, width = Infinity) {
      strings.forEach(s => this.strokeText(s, width).move(Vector.from(0, lineheight)));
      return this;
    }

  /** Обводка многострочного текста с выравниванием по правому краю
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    strokeTextMultilineRight(strings, lineheight, width = Infinity) { // ! TODO:
      strings.forEach(s => this.strokeText(s, width).move(Vector.from(0, lineheight)));
      return this;
    }

  /** Обводка многострочного текста с выравниванием по центру
    * @param {...string} strings строки текста
    * @param {number} lineheight высота строки
    * @param {number} width максимальная ширина текста
    * @return {Canvas} @this
    */
    strokeTextMultilineCenter(strings, lineheight, width = Infinity) {
      strings.forEach(s => this.strokeTextCenter(s, width).move(Vector.from(0, lineheight)));
      return this;
    }

  /** Содержимое всего канваса в формате DATA URI
    * @param {string} [format='image/png'] формат получаемого изображения
    * @param {number} [quality=1] качество изображения
    * @return {string} data URI
    */
    data(format = 'image/png', quality = 1) {
      return this.canvas.toDataURL(format, quality);
    }

  /** Содержимое всего канваса в бинарном формате @async
    * @param {string} [format='image/png'] формат получаемого изображения
    * @param {number} [quality=1] качество изображения
    * @return {Promise} {Blob}
    */
    blob(format = 'image/png', quality = 1) {
      return new Promise(resolve => this.canvas.toBlob(blob => resolve(blob), format, quality));
    }

  /** Получение изображения из содержимого canvas / toImage
    * @param {string} [format='image/png'] формат получаемого изображения
    * @param {number} [quality=1] качество изображения
    * @return {Image} изображение с содержимым canvas
    */
    toImage(format = 'image/png', quality = 1) {
      const image = new Image();
      image.src = this.data(format, quality);
      return image;
    }

  /** Получение размеров непрозрачной части изображения (crop/trim) / bounds
    * @return {object} объект с информацией о границах {left, right, top, bottom, offset, size}
    */
    bounds() {
      const pixels = this.PIXELS(), l = pixels.data.length;
      let i, x, y;
      const W = this.canvas.width, H = this.canvas.height;
      const bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
      };

      for (i = 0; i < l; i += 4) {
        if (pixels.data[i + 3] === 0) continue;

        x = (i / 4) % W;
        y = Math.floor((i / 4) / W); // ~~k - faster, but es-lint no-bitwise

        if (bound.top === null) {
          bound.top = y;
        }

        if (bound.left === null) {
          bound.left = x;
        } else if (x < bound.left) {
          bound.left = x;
        }

        if (bound.right === null) {
          bound.right = x;
        } else if (bound.right < x) {
          bound.right = x;
        }

        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }

      bound.right = W - bound.right;
      bound.bottom = H - bound.bottom;
      const width  = W - bound.right - bound.left;
      const height = H - bound.bottom - bound.top;
      return {
        ...bound,
        offset: Vector.from(bound.left, bound.top),
        size  : Vector.from(width, height)
      }
    }
  }

// #region [Private]
  const dictionary = {
    fill  : 'fillStyle',
    stroke: 'strokeStyle',
    width : 'lineWidth',
    cap   : 'lineCap',
    join  : 'lineJoin',
    text  : 'fillTextStyle',
    base  : 'textBaseline',
    align : 'textAlign',
    comp  : 'globalCompositeOperation',
    alpha : 'globalAlpha'
  }; // font, shadow@

  /** / defaultDrawImageOptions */
    function defaultDrawImageOptions(image) {
      return {
        point : Vector.zero,
        offset: Vector.zero,
        size  : Vector.from(image.width, image.height),
        region: Vector.from(image.width, image.height)
      };
    }
// #endregion
