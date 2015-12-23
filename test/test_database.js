global._ = require('lodash');
global.moment = require('moment-timezone');

var fs = require('fs');
var path = require('path');
var nconf = require('nconf');

nconf.use('file', { file: path.join(__dirname, '../config.json') });

var env = nconf.get('env');
global.config = nconf.get(nconf.get('env'));

require('../util/database.js');

db.User.findAll({ include: [{ model: db.City, include:[{ model: db.Country }] }] }).then(function(result) {
	_.forEach(result, function(value, key) {
		//console.log(JSON.stringify(value));
		console.log(value.mapAttributes(value));
	});
});

// ORM
/*
db.User.findAll().then(function(result) {
	_.forEach(result, function(value, key) {
		console.log(value.mapAttributes());
	});
});

db.City.findAll().then(function(result) {
	_.forEach(result, function(value, key) {
		console.log(value.mapAttributes());
	});
});

db.City.all().then(function(result){
	console.log(result[0].name);
  	_.forEach(result, function(value, key) {
		console.log(value.mapAttributes());
	});
});*/

/*db.City.find({ where: { name: 'Chengdu' } }).then(function (result) {
	if (result === null) {
		console.log('not exists');
		try {
			db.City.create({ name: 'Chengdu', createAt: new Date() }).then(
				function(result) {
				 	console.log('created');
				},
				function(err) {
					console.log('error');
					console.log(err);	
				}
			);
		} catch (ex) {
			console.log(ex);
		}
	}
	else {
		console.log('exists');
	}
});*/

/*db.City.findAndCountAll({where: ["name LIKE '%i%'"], offset: 0, limit: 10}).then(function(result) {
  console.log(result.count);
  //console.log(result.rows);
  _.forEach(result.rows, function(value, key) {
		console.log(value.mapAttributes());
	});
});*/

// raw sql
/*db.sequelize.query("SELECT * FROM city").then(function(myTableRows) {
  	_.forEach(myTableRows, function(value, key) {
  		console.log(value);
  		//console.log(JSON.stringify(value));
	});
});*/

/*
var pg = require('pg');
var conString = "postgres://appledev112:@localhost/test";

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 20 (also configurable)
pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT * FROM city', function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result);
    //output: 1
  });
});
*/