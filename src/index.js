const io = require("socket.io")(7333, {
  cors: {
    origin: "*",
  },
});

const Printer = require("./bematech/model-4200");

let socket = null;
let printers = {};

module.exports = {
  start() {
    io.on("connection", this.onSocketConnection.bind(this));
  },
  onSocketConnection(_socket) {
    socket = _socket;
    socket.emit("socket:connected", {});

    socket.on("print", this.print.bind(this));
  },
  print(options) {
    socket.emit("print:start");

    this.loadPrinter(options).then(
      (printer) => {
        return printer.print(options).then(() => {
          socket.emit("print:end");

          io.emit("print:message", {
            description: "Impressão realizada com sucesso",
            time: new Date(),
            type: "success",
          });
        });
      },
      (err) => {
        return io.emit("print:error", {
          description: err.description,
          code: err.code,
          time: new Date(),
          type: "error",
        });
      }
    );
  },
  loadPrinter(options) {
    return new Promise((resolve, reject) => {
      if (printers[options.printer.ip]) {
        io.emit("print:message", {
          description: "Impressora já encontra-se carregada",
          time: new Date(),
          type: "info",
        });

        return resolve(printers[options.printer.ip]);
      } else {
        io.emit("print:message", {
          description: "Impressora precisa ser carregada...",
          time: new Date(),
          type: "info",
        });

        new Printer({ ip: options.printer.ip, port: 9100 }).then(
          (_printer) => {
            printers[options.printer.ip] = _printer;
            io.emit("print:message", {
              description: "Criado socket com a impressora",
              time: new Date(),
              type: "info",
            });

            return resolve(printers[options.printer.ip]);
          },
          (err) => {
            return reject(err);
          }
        );
      }
    });
  },
};
