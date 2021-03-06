const test = require('ava');
const request = require('supertest');
const server = require('../server');
const controller = require('../controllers');

var waitForPort = require('wait-for-port');

test.beforeEach(t => {
	
	waitForPort('localhost', 8080, {"numRetries": 10}, function(err) {
		if(err) raise(err);
	});
	server().start(err => {
	});

});

test.afterEach( t => {
	server().stop();
	waitForPort('localhost', 8080, {"numRetries": 10}, function(err) {
		if(err) raise(err);
	});
});


function populateMultipleHosts()
{
	controller.setTestVals(
	   {
		   "hosts": [
		       {
				   "id": 1,
				   "name": "localhost.localdomain",
				   "ipv4": "127.0.0.1"
		       },
		       {
				   "id": 100,
				   "name": "localhost.hundredshire",
				   "ipv4": "127.10.10.1"
		       },
		       {
				   "id": 103,
				   "name": "google.com",
				   "ipv4": "172.217.3.216"
		       }
		  
		   ]
	   }
	);
}

test.serial('Get a list of hosts', async t => {

    populateMultipleHosts();
	
	t.plan(5);
	
	const res = await request('http://localhost:8080')
	    .get('/hosts')
	    .set('Accept', 'application/json');

	var hosts = JSON.parse(res.text);
    
	t.is(res.status, 200);
	t.is(hosts[0].id, 1);
	t.is(hosts[1].ipv4, "127.10.10.1");
	t.is(hosts[2].name, "google.com");
	t.is(hosts.length, 3);
});

test.serial('Get a single valid host', async t => {

	t.plan(4);

    populateMultipleHosts();
	
	const res = await request('http://localhost:8080')
	    .get('/host/100')
	    .set('Accept', 'application/json');
	
	var host = JSON.parse(res.text);
	
	t.is(res.status, 200);
	t.is(host.id, 100);
	t.is(host.ipv4, "127.10.10.1");
	t.is(host.name, "localhost.hundredshire");
});

test.serial('Get a single invalid host', async t => {

	t.plan(2);

    populateMultipleHosts();
	
	const res = await request('http://localhost:8080')
	    .get('/host/2')
	    .set('Accept', 'application/json');
	
	t.is(res.status, 404);
	t.is(res.text, "Host not found");
});

test.serial('Create a single host', async t => {
	var host = {
		"id": 44,
		"name": "hosttoadd.tenable.com",
		"ipv4": "127.14.14.100"
	};
	
	controller.setTestVals({"hosts": []});
	
	t.plan(6);
	
	var host_str = JSON.stringify(host);
	var res = await request('http://localhost:8080')
		.post('/host')
		.set('Content-Type', 'application/json')
		.send(host_str);
		
	t.is(res.status, 201);
	t.is(res.header.location, "/host/0");
	
	res = await request('http://localhost:8080')
		.get('/host/44')
		.set('Accept', 'application/json');
	
	var host = JSON.parse(res.text);
	
	t.is(res.status, 200);
	t.is(host.id, 44);
	t.is(host.ipv4, "127.14.14.100");
	t.is(host.name, "hosttoadd.tenable.com");
});

test.serial('Update a single host', async t => {
	
    populateMultipleHosts();
	
	var updated_host = {
		"id": 101,
		"name": "different-host.tenable.com",
		"ipv4": "127.22.14.116"
	};
	
	var host_str = JSON.stringify(updated_host);
	var res = await request('http://localhost:8080')
	    .put('/host/103')
		.set('Content-Type', 'application/json')
		.send(host_str);
		
	t.is(res.status, 200);
	
	res = await request('http://localhost:8080')
		.get('/host/103')
		.set('Accept', 'application/json');
	
	var host = JSON.parse(res.text);
	
	t.is(res.status, 200);
	t.is(host.id, 103);
	t.is(host.ipv4, "127.22.14.116");
	t.is(host.name, "different-host.tenable.com");	
});

test.serial('Delete a single host', async t => {

	t.plan(3);

    populateMultipleHosts();
	
	var res = await request('http://localhost:8080')
	    .delete('/host/1')
	    .set('Accept', 'application/json');
	
	
	t.is(res.status, 200);
	
	res = await request('http://localhost:8080')
	    .get('/host/1')
	    .set('Accept', 'application/json');
	
	t.is(res.status, 404);
	t.is(res.text, "Host not found");
});

test.serial('Delete all hosts', async t => {
	
	t.plan(3);

    populateMultipleHosts();
	
	var res = await request('http://localhost:8080')
	    .delete('/hosts')
	    .set('Accept', 'application/json');
	
	
	t.is(res.status, 200);
	
	res = await request('http://localhost:8080')
	    .get('/hosts')
	    .set('Accept', 'application/json');
	
	var hosts = JSON.parse(res.text);
    
	t.is(res.status, 200);
	t.is(hosts.length, 0);
	
});

test.serial('Delete selected hosts', async t => {
	t.plan(3);

    populateMultipleHosts();
	
	var hosts_to_del = [103, 1];

	hosts_to_del = JSON.stringify(hosts_to_del);
	
	var res = await request('http://localhost:8080')
	    .delete('/hosts')
	    .set('Content-Type', 'application/json')
		.send(hosts_to_del);
	
	t.is(res.status, 200);
	
	res = await request('http://localhost:8080')
	    .get('/hosts')
	    .set('Accept', 'application/json');
		
	
	var hosts = JSON.parse(res.text);
	
	t.is(res.status, 200);
	t.is(hosts.length, 1);
});