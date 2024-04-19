const amqp = require("amqplib/callback_api");

let channel;
function connectRabbit() {
  new Promise((resolve, reject) => {
    amqp.connect("amqp://localhost:5672", function (error0, connection) {
      if (error0) {
        reject(error0);
      }
      connection.createChannel(function (error1, ch) {
        if (error1) {
          reject(error1);
        }
        channel = ch;
        var queue = "result";

        channel.assertQueue(queue, {
          durable: false,
        });

        resolve();
      });
    });
  });
}

module.exports = { channel };
