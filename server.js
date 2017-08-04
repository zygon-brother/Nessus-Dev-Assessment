'use strict';

const Hapi = require('hapi');
const controller = require('./controllers');

function Evaluation() {
	const server = new Hapi.Server();

    server.connection({port: 8080, host: 'localhost' });
    server.route(controller.routes);
	return server;
}

module.exports = Evaluation;