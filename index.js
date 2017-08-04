'use strict';

const Hapi = require('hapi');
const routes = require('./controllers');
const server = require('./server');

server().start(() => {
	console.log('Tom Pearson\'s R&D Assessment Server starting...');
});