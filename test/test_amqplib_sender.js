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

global.mq.start();

let index = 1;
setInterval(() => {
	let text = '';
	if (index%2 == 0)
		text = 'test test test';
	else
		text = 'blah blah blah';
	index++;
	global.mq.publish('exampleexchange', 'exampleprocess', new Buffer(text));
}, 1000);