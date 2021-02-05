/** Работа с изображениями {Img} @class
  */
  export default class Img {
  /** Загрузка изображения по Api
    * @static @async
    * @param {string} url адрес загружаемого изображения
    * @return {Promise<Image>} загруженное изображение
    */
    static load(url) {
      return fetch(url)
        .then(response => response.blob())
        .then(blob => window.URL.createObjectURL(blob))
        .then(src => new Promise(resolve => {
          const image = new Image();
          image.onload = () => {
            window.URL.revokeObjectURL(src);
            resolve(image);
          };
          image.src = src;
        }));
    }
  }
