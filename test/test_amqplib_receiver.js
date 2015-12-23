/*jshint esnext: true*/
/*jshint node: true*/
'use strict';

global._ = require('lodash');
global.moment = require('moment-timezone');

let fs = require('fs');
let path = require('path');
let nconf = require('nconf');

nconf.use('file', { file: path.join(__dirname, '../config.json') });

let env = nconf.get('env');
global.config = nconf.get(nconf.get('env'));

require('../util/mq.js');
global.mq.start('examplequeue', (msg) => {
	console.log(`[MSG] : ${msg}`);
});