/** @section @imports */
import Context from './Context.js';

/** @section @exports */
/** {Path} Рисование путей @export @class */
  export default class Path extends Context {
  /** Создание пути рисования
    * @param {Path2D|SVGPath} path? another path object
    */
    constructor(path) {
      path = new Path2D(path);
      super(path);
    }
  }
