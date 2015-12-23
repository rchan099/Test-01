'use strict';

let amqp = require('amqp');
let connection = amqp.createConnection({ url: 'amqp://uyoicoul:Mlh3iH0kHvBX2KErpA5Djend4dvErv4Q@jaguar.rmq.cloudamqp.com/uyoicoul' });

// Wait for connection to become established.
connection.on('ready', () => {
  // Use the default 'amq.topic' exchange
  console.log('ready');

  connection.exchange('exampleexchange', { type: 'direct', passive: true, durable: true, autoDelete: false }, function (e) {
    console.log('Exchange ' + e.name + ' is open');

    var message = process.argv[2];
    console.log(message);
    e.publish('exampleprocess', message, { mandatory: false, immediate: false });

    connection.disconnect();
  });
});