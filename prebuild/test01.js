/*jshint esnext: true*/
/*jshint node: true*/
'use strict';

class Database {

    // constructor
    constructor() {
        this.Sequelize = require('sequelize');
        this.config = global.config.database;
        this.sequelize = null;

        if (this.config.heroku) {
            // the application is executed on Heroku ... use the postgres database
            this.sequelize = new this.Sequelize(this.config.heroku, {
                dialect: 'postgres',
                protocol: 'postgres',
                port: this.config.port,
                host: this.config.host,
                logging: this.config.logging
            });
        } else {
            // the application is executed on the local machine ... 
            this.sequelize = new this.Sequelize(this.config.schema, this.config.user, this.config.password, {
                host: this.config.host,
                port: this.config.port,
                logging: this.config.logging,
                dialect: this.config.dialect,
                pool : this.config.pool,
                omitNull: this.config.omitNull
            });
        }

        this.sequelize.map = (ctx) => {
            let obj = {};
            ctx.attributes.forEach(function(attr) {
                obj[attr] = ctx[attr];
            });
            return obj;
        };
    }
}

if (!global.hasOwnProperty('db')) {
    let database = new Database();

    global.db = {
        Sequelize: database.Sequelize,
        sequelize: database.sequelize
    };

    // import models from dir
    let dir = `${__dirname}/../model`;
    let files = require('readdir').readSync(dir, ['**.js']);
    global._.forEach(files, function(file) {
        let cName = file.split('.')[0];
        let mName = cName.substring(0, 1).toUpperCase() + cName.substring(1);
        global.db[mName] = global.db.sequelize.import(`${dir}/${cName}`);
    });

    global._.forEach(global.db, function(val, key) {
        if(global._.isFunction(val.associate)) {
            val.associate(global.db);
        }
    });
}

module.exports = global.db;
/*jshint esnext: true*/
/*jshint node: true*/
'use strict';

class MessageQueue {

	// constructor
	constructor() {
		this.amqp = require('amqplib/callback_api');
		this.config = global.config.mq;
		this.amqpConn = null;
		this.channel = null;
		this.offlineQueue = [];
	}

	// initialization
	start(queue, callback) {
		this.amqp.connect(`${this.config.url}?heartbeat=60`, (err, conn) => {
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
				return setTimeout(this.start, 1000);
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
/*jshint esnext: true*/
/*jshint node: true*/

/**
 * City model
 * @param  {[type]} sequelize [description]
 * @param  {[type]} DataTypes [description]
 * @return {[type]}           [description]
 */
module.exports = (sequelize, DataTypes) => {
    var City = sequelize.define('city', {
        id: { type: DataTypes.INTEGER, allowNull: true, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true, validate: { max: 200 } },
        createAt: { type: DataTypes.DATE, allowNull: true },
        updateAt: { type: DataTypes.DATE, allowNull: true },
        countryId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        timestamps: false,
        freezeTableName: true,
        instanceMethods: {
            mapAttributes: sequelize.map
        },
        classMethods: {
            associate: (models) => {
                /*
                Associations can be defined here. E.g. like this:
                global.db.User.hasMany(global.db.SomethingElse)
                */
                models.City.hasMany(models.User);
                models.User.belongsTo(models.City);
            }
        }
    });
    return City;
};/*jshint esnext: true*/
/*jshint node: true*/

/**
 * Country model
 * @param  {[type]} sequelize [description]
 * @param  {[type]} DataTypes [description]
 * @return {[type]}           [description]
 */
module.exports = (sequelize, DataTypes) => {
    var Country = sequelize.define('country', {
        id: { type: DataTypes.INTEGER, allowNull: true, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true, validate: { max: 200 } },
        createAt: { type: DataTypes.DATE, allowNull: true },
        updateAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
        timestamps: false,
        freezeTableName: true,
        instanceMethods: {
            mapAttributes: sequelize.map
        },
        classMethods: {
            associate: (models) => {
                /*
                Associations can be defined here. E.g. like this:
                global.db.User.hasMany(global.db.SomethingElse)
                */
                models.Country.hasMany(models.City);
                models.City.belongsTo(models.Country);
            }
        }
    });
    return Country;
};/*jshint esnext: true*/
/*jshint node: true*/

/**
 * User model
 * @param  {[type]} sequelize [description]
 * @param  {[type]} DataTypes [description]
 * @return {[type]}           [description]
 */
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('user', {
        id: { type: DataTypes.INTEGER, allowNull: true, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true, validate: { max: 200 } },
        gender: { type: DataTypes.INTEGER, allowNull: true },
        cityId : { type: DataTypes.INTEGER, allowNull: true },
        createAt : { type: DataTypes.DATE, allowNull: true },
        updateAt : { type: DataTypes.DATE, allowNull: true },
    },
    {
        timestamps: false,
        freezeTableName: true,
        instanceMethods: {
            mapAttributes: sequelize.map
        }
    });
    return User;
};