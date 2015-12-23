'use strict';
let amqp = require('amqplib/callback_api');

class MessageQueue {

	// constructor
	constructor() {
		this.config = config.mq;
		this.amqpConn = null;
		this.channel = null;
		this.offlineQueue = [];
	}

	// initialization
	start(queue, callback) {
		amqp.connect(`${this.config.url}?heartbeat=60`, (err, conn) => {
			if (err) {
				console.error('[MQ]', err.message);
				return setTimeout(this.start, 1000);
			}
			conn.on('error', (err) => {
				if (err.message !== 'Connection closing') {
        			console.error('[MQ] conn error', err.message);
				}
			});
			conn.on('close', () => {
				console.error('[MQ] reconnecting');
				return setTimeout(start, 1000);
			});

			console.log('[MQ] connected');
			this.amqpConn = conn;	
			if (queue){
				this.startConsumer(queue, callback);
			}
			else {
				this.startPublisher();
			}
		});
	}

	// start channel
	startPublisher() {
		this.amqpConn.createConfirmChannel((err, ch) => {
			if (this.closeOnErr(err)) {
				return;
			}
			else {
				ch.on('error', (err) => {
					console.error('[MQ] channel error', err.message);
				});
				ch.on('close', () => {
					console.log('[MQ] channel close');
				});
			
				this.channel = ch;
				console.log('[MQ] channel established');
				while (true) {
					let m = this.offlineQueue.shift();
					if (!m) break;
					this.publish(m[0], m[1], m[2]);
				}
			}
		});
	}
	
	// publish message to exchanger
	publish(exchange, routingKey, content) {
		try {
			if (!this.channel)
			{
				this.offlineQueue.push([exchange, routingKey, content]);
			}
			else {
				this.channel.publish(exchange, routingKey, content, {persistent: true}, (err, ok) => {
					if (err) {
						console.error('[MQ] publish', err);
						this.offlineQueue.push([exchange, routingKey, content]);
						this.channel.connection.close();
					}	
				});
			}
		}
		catch (ex) {                                                                                                                               
			console.error("[MQ] publish", ex.message);
			this.offlineQueue.push([exchange, routingKey, content]);
		}
	}

	// start consumer
	startConsumer(queue, callback) {
		this.amqpConn.createChannel((err, ch) => {
			if (this.closeOnErr(err)) {
				return;
			}
			else {
				ch.on('error', (err) => {
					console.error('[MQ] channel error', err.message);
				});
				ch.on('close', () => {
					console.log('[MQ] channel close');
				});
			
				//ch.prefetch(10);
				ch.assertQueue(queue, { durable: true }, (err, ok) => {
					if (this.closeOnErr(err)) {
						return;
					}
					else {
						console.log('Consumer started');
						ch.consume(queue, 
						(msg) => {
							ch.ack(msg);
							if (callback) {
								callback(msg.content.toString());
							}
							//ch.reject(msg, true);
						}, 
						{ noAck: false });
					}
				});
			}
		});
	}

	// close connection on error
	closeOnErr(err) {
 		if (!err) {
 			return false;
 		}
 		else {
 			console.error('[MQ]', err);
 			this.amqpConn.close();
 			return true;
 		}
 	}
}

if (!global.hasOwnProperty('mq')) {
	global.mq = new MessageQueue();
}

module.exports = global.mq;
