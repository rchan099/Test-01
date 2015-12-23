'use strict';

global._ = require('lodash');
global.moment = require('moment-timezone');

var fs = require('fs');
var path = require('path');
var nconf = require('nconf');

nconf.use('file', { file: path.join(__dirname, '../config.json') });

var env = nconf.get('env');
global.config = nconf.get(nconf.get('env'));

require('../util/mq.js');
global.mq.start('examplequeue', (msg) => {
	console.log(`[MSG] : ${msg}`);
});;