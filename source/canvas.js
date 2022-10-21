/** Рисование на холсте @2D @Canvas
  *
  * @typedef {object} CanvasDecoration Стили для рисования на canvas
  * @property {string | CanvasGradient | CanvasPattern=} fill CSS цвет или стиль, используемый при выполнении заливки фигур; соответствует значению {fillStyle}
  * @property {string | CanvasGradient | CanvasPattern=} stroke CSS цвет или стиль, используемый при выполнении обводки фигур; соответствует значению {strokeStyle}
  * @property {number=} width толщина линий в пикселах; Positive; соответствует значению {lineWidth}
  * @property {"butt" | "round" | "square"=} cap концы линий; соответствует значению {lineCap}
  * @property {number=} miters длина среза: расстояние между внутренним и внешнем углом, образованным пересечением двух линий (cap = "butt"); соответствует значению {miterLimit}
  * @property {"bevel" | "round" | "miter"=} join определяет форму вершин в которых линии сходятся; соответствует значению {lineJoin}
  * @property {"top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom"=} baseline базовая линия при рисовании текста; соответствует значению {textBaseline}
  * @property {"left" | "right" | "center" | "start" | "end"=} align выравнивание текста, использованное при прорисовке; соответствует значению {textAlign}
  * @property {"ltr" | "rtl" | "inherit"=} direction направление текста
  * @property {"source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "copy" | "xor" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity"=} composite стиль операций наложения; соответствует значению {globalCompositeOperation}
  * @property {number=} alpha значение, которое будет применено к фигурам и картинкам до того как они будут отрисованы; Percent; соответствует значению {globalAlpha}
  * @property {string=} font CSS стиль, который будет использоваться для вывода текста
  * @property {string=} shadow CSS цвет теней; соответствует значению {shadowColor}
  * @property {number=} shadowBlur размытие теней; соответствует значению {shadowBlur}
  * @property {number=} shadowX смещение тени по X; соответствует значению {shadowOffsetX}
  * @property {number=} shadowY смещение тени по Y; соответствует значению {shadowOffsetY}
  * @property {"low" | "medium" | "high"=} smoothing качество сглаживания изображений; соответствует значению {imageSmoothingQuality}
  * @property {boolean=} smooth включает / выключает сглаживание изображений
  *
  * @typedef {object} StackItem История преобразований
  * @property {Matrix} matrix матрица преобразований
  * @property {Vector} pointer положение пера
  * @property {CanvasDecoration} decore оформление
  *
  * @todo Ещё многое не описано. +этим тегом помечаю кандидаты на оптимизацию, переписывание и т. д.
  * @feature Цепочные вызовы, типа `Vector.from(1, 2, 3).scale(2).inverse.normal`
  */

import Vector  from 'javascript-algebra/source/vector.js';
import Matrix  from 'javascript-algebra/source/matrix.js';
import Context from './context.js';

/** {Canvas} Рисование на холсте @export @class @default */
  export default class Canvas extends Context {
  /** @type {CanvasDecoration} Стили для рисования */
    #style = {};

  /** @type {HTMLCanvasElement} Холст */
    #canvas;

  /** @type {Matrix} Матрица преобразований */
    #matrix = Matrix.i3;

  /** @type {Array<StackItem>} История преобразований */
    #stack = [];

  /** Создание контекста @constructor
    * @param {CanvasRenderingContext2D} context DOM контекст рисования
    * @param {HTMLCanvasElement} canvas DOM элемент для рисования
    */
    constructor(context, canvas) {
      super(context);
      this.#canvas = canvas;
      this.#style = this.#decore;
    }

  /** @section Рендеринг */
  /** Рисование контура / stroke
    * @return {Canvas} this
    */
    stroke() {
      this.context.stroke();
      return this;
    }

  /** Заливка контура / fill
    * @return {Canvas} this
    */
    fill() {
      this.context.fill();
      return this;
    }

  /** Заливка текста / text
    * @param {string} text текст
    * @param {number} width максимальная ширина текста
    * @param {Vector} position положение текста
    * @return {Canvas} this
    */
    text(text, width, position = this.pointer) {
      this.context.fillText(text, position.x, position.y, width);
      return this;
    }

  /** Помещение пера на холст / begin
    * @return {Canvas} this
    */
    begin() {
      this.context.beginPath();
      return this;
    }

  /** Сохранение текущего состояния холста / save
    * (преобразование + положение пера + оформление)
    * @return {Canvas} this
    */
    save() {
      this.context.save();
      this.#stack.push({
        matrix:  this.#matrix.copy,
        pointer: this.pointer.xy,
        decore:  this.style
      });
      return this;
    }

  /** Возврат к предыдущему состоянию холста / restore
    * (преобразование + положение пера + оформление)
    * @return {Canvas} this
    */
    restore() {
      this.context.restore();
      // const last = this.#stack.pop();
      // this.pointer = last.locate;
      // this.matrix  = last.matrix;
      return this;
    }

  /** @section Стили */
  /** Текущий cтиль / #decore @private @readonly
    *
    */
    get #decore() {
      const properties = Object.keys(decorations);
      const result = {};
      properties.forEach(property => {
        result[property] = this.context[decorations[property]];
      });
      return result;
    }

  /** Tекущий стиль / style @public @cached @readonly
    * @return {CanvasDecoration} стили рисования
    */
    get style() {
      const style = {};
      const keys = Object.keys(this.#style);
      keys.forEach(property => {
        style[property] = this.#style[property];
      });
      return style;
    }

  /** Изменение стиля рисования / decore
    * @param {CanvasDecoration?} style описание стиля canvas
    * @return {Canvas} this
    */
    decore(style = {}) {
      const keys = Object.keys(style);
      const properties = Object.keys(decorations);
      keys.forEach(property => {
        if (!properties.includes(property)) return undefined;
        this.context[decorations[property]] = style[property];
        this.#style[property] = this.context[decorations[property]]; // style[property];
      });
      return this;
    }

  /** @section FACTORY @static */
  /** Создание контекста рисования
    * @param {HTMLCanvasElement} canvas DOM элемент для рисования
    * @return {Canvas} контекст рисования
    */
    static from(canvas) {
      const context = canvas.getContext('2d');
      return new Canvas(context, canvas);
    }
  }

// #region [Private]
/** @type {{[property in keyof CanvasDecoration]: string}} / decorations */
  const decorations = Object.freeze({
    fill      : 'fillStyle',
    stroke    : 'strokeStyle',
    width     : 'lineWidth',
    cap       : 'lineCap',
    miters    : 'miterLimit',
    join      : 'lineJoin',
    baseline  : 'textBaseline',
    align     : 'textAlign',
    direction : 'direction',
    composite : 'globalCompositeOperation',
    alpha     : 'globalAlpha',
    font      : 'font',
    shadow    : 'shadowColor',
    shadowBlur: 'shadowBlur',
    shadowX   : 'shadowOffsetX',
    shadowY   : 'shadowOffsetY',
    smoothing : 'imageSmoothingQuality',
    smooth    : 'imageSmoothingEnabled'
  });
// #endregion

/** @TODO:
  https://github.com/fserb/canvas2d
  https://github.com/fserb/canvas2D/blob/master/spec/reset.md
  ctx.reset();
  https://github.com/fserb/canvas2D/blob/master/spec/color-input.md
  ctx.fillStyle = new CSSRGB(1, 0, 1, 0.5); // half-transparent magenta
  ctx.strokeStyle = new CSSHSL(CSS.deg(0), 0.5, 1); // bright red
  ctx.fillStyle = [0.5, 0.5, 0.5]
  https://github.com/fserb/canvas2D/blob/master/spec/text-modifiers.md
  ctx.textLetterSpacing = "3px";
  ctx.fontVariantCaps = "all-small-caps";
  ctx.textLetterSpacing // CSS letter-spacing
  ctx.textWordSpacing   // CSS word-spacing
  ctx.fontVariantCaps   // CSS font-variant-caps
  ctx.fontKerning       // CSS font-kerning
  ctx.fontStretch       // CSS font-stretch
  ctx.textRendering     // CSS text-rendering
  https://github.com/fserb/canvas2D/blob/master/spec/perspective-transforms.md
  void rotate3d(unrestricted double angleZ, optional unrestricted double angleY, optional unrestricted dobule angleX);
  void rotateAxis(unrestricted double axisX, unrestricted double axisY, unrestricted double axisZ, unrestricted double angle);
  void perspective(unrestricted double length);
  etc.
  https://github.com/fserb/canvas2D/blob/master/spec/conic-gradient.md
  const grad = ctx.createConicGradient(0, 100, 100);
  grad.addColorStop(0, "red");
  grad.addColorStop(0.25, "orange");
  grad.addColorStop(0.5, "yellow");
  grad.addColorStop(0.75, "green");
  grad.addColorStop(1, "blue");
  ctx.fillStyle = grad;
  https://github.com/fserb/canvas2D/blob/master/spec/roundrect.md
  ctx.roundRect(10, 10, 50, 50, [10]);
  ctx.fillRoundRect(100, 10, 50, 50, [10, 10, 0, 10]);
  void clearRoundRect(double x, double y, double w, double h, sequence<double> radius);
  void fillRoundRect(double x, double y, double w, double h, sequence<double> radius);
  void strokeRoundRect(double x, double y, double w, double h, sequence<double> radius);
*/
