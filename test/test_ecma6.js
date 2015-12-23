/*jshint esnext: true*/
/*jshint node: true*/
'use strict';

let text = 'abc';
let start = (x) => {
	console.log(`start ${x}`);
};

start(text);

class MQ {
	constructor() {
		this.identity = 0;
		this.arr = [];
		console.log('MQ constructor');
		this.printText('bcd');
	}
	printText(text) {
		console.log(text);
	}
	setId(identity) {
		this.identity = identity;
	}
	printId() {
		console.log(this.identity);
	}
	static defaultMatrix() {
		console.log('default matrix');
	}
}

MQ.defaultMatrix();
let mq  = new MQ();
mq.printId();
mq.setId(1);
mq.printId();