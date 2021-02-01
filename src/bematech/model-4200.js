"use strict";

const net = require("net");

const socketTimeout = 2500;

let Printer = class Printer {
  constructor(options) {
    this.client = new net.Socket();
    this.client.setTimeout(socketTimeout);

    return new Promise((resolve, reject) => {
      this.client.connect(9100, options.ip, () => {
        this.client.setDefaultEncoding("utf-8");

        return resolve(this);
      });

      this.client.on("timeout", (exception) => {
        this.client.setDefaultEncoding("utf-8");

        return reject({
          description:
            "Não foi possível conectar com a impressora ou ela foi desligada",
          code: 301,
        });
      });

      this.client.on("error", (exception) => {
        this.client.setDefaultEncoding("utf-8");

        return reject({
          description:
            "Não foi possível conectar com a impressora ou ela foi desligada",
          code: 302,
        });
      });
    });
  }

  print(options) {
    return new Promise((resolve, reject) => {
      options.data.data.map((data) => {
        this.client.write(`${data}`);
      });

      return resolve();
    });
  }
};

module.exports = Printer;
