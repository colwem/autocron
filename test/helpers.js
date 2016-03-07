'use strict';

class Helpers {
  static uuidGenerator() {
    let s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    let a = s
        .replace(/[xy]/g, (c) => {
          let r, v;
          r = Math.random() * 16 | 0;
          v = (c === "x" ? r : r & 0x3 | 0x8);
          return v.toString(16);
        });
    return a;
  };

  static badUuidGenerator() {
    return 'blah';
  }
}

module.exports = Helpers;

