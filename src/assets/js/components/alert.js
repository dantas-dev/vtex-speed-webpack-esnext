export default class Alert {
  constructor(mensage) {
    this.mensage = mensage;
  }

  init() {
    return this.mensage;
  }
}

const warning = new Alert('read more https://github.com/EduD');
warning.init();
