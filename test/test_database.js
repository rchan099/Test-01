'use strict';

global._ = require('lodash');
global.moment = require('moment-timezone');

let fs = require('fs');
let path = require('path');
let nconf = require('nconf');

nconf.use('file', { file: path.join(__dirname, '../config.json') });

let env = nconf.get('env');
global.config = nconf.get(nconf.get('env'));

require('../util/database.js');

db.User.findAll({ include: [{ model: db.City, include:[{ model: db.Country }] }] }).then((result) => {
	_.forEach(result, (value, key) => {
		//console.log(JSON.stringify(value));
		console.log(value.mapAttributes(value));
	});
});

db.City.find({ where: { name: 'Chengdu' } }).then((result) => {
	if (result === null) {
		console.log('not exists');
		try {
			db.City.create({ name: 'Chengdu', createAt: new Date() }).then(
				(result) => {
				 	console.log('created');
				},
				(err) => {
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
});


db.City.findAndCountAll({ where: ["name LIKE '%i%'"], offset: 0, limit: 10}).then((result) => {
  console.log(result.count);
  //console.log(result.rows);
  _.forEach(result.rows, (value, key) => {
		console.log(value.mapAttributes(value));
	});
});

/*
//raw sql
db.sequelize.query("SELECT * FROM city").then((myTableRows) => {
  	_.forEach(myTableRows, (value, key) => {
  		console.log(value);
  		//console.log(JSON.stringify(value));
	});
});
*/
