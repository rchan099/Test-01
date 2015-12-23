/*jshint esnext: true*/
/*jshint node: true*/
'use strict';

let amqp = require('amqp');
let connection = amqp.createConnection({ url: 'amqp://uyoicoul:Mlh3iH0kHvBX2KErpA5Djend4dvErv4Q@jaguar.rmq.cloudamqp.com/uyoicoul' });

// Wait for connection to become established.
connection.on('ready', () => {
  // Use the default 'amq.topic' exchange
  console.log('ready');
  connection.queue('examplequeue', { passive: true, durable: true, exclusive: false, autoDelete: false }, (q) => {
      console.log('examplequeue');
      // Catch all messages
      q.bind('#');

      // Receive messages
      q.subscribe((message, headers, deliveryInfo, messageObject) => {
        console.log('Got a message with routing key ' + deliveryInfo.routingKey);
      });

      /*
        q.subscribe(function (message) {
        console.log('subscribe');
        // Print messages to stdout
        console.log(message);
      });
      */
  });
});