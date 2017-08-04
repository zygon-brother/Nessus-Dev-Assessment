var hosts = {"hosts" : []};

exports.setTestVals = (function(host_vals)
{
	hosts = host_vals;
});


exports.routes = [
	{
		method: 'GET',
		path: '/hosts',
		handler: function (request, reply) {
			var result = { "hosts" : [] };
			for(var idx in hosts.hosts) {
				if(hosts.hosts[idx]) {
					var host = hosts.hosts[idx];
					result.hosts[result.hosts.length] = host;
				}
			}
			var resp_hosts = JSON.stringify(result.hosts);
			reply(resp_hosts);
		}
	},
	{
		method: 'GET',
		path: '/host/{host}',
		handler: function (request, reply) {
			for(var idx in hosts.hosts) {
				var host = hosts.hosts[idx];
				if(host.id == request.params.host) {
					reply(JSON.stringify(host));
					return;
				}
				    
			}
			
			reply('Host not found').code(404);
		}
	},
	{
		method: 'POST',
		path: '/host',
		handler: function (request, reply) {
			try {
			    var new_host = request.payload;
				
				if(!new_host.hasOwnProperty("id") ||
				   !new_host.hasOwnProperty("name") ||
				   !new_host.hasOwnProperty("ipv4")) {
				    throw "Bad host format"
				}

				var new_idx = hosts.hosts.length
				hosts.hosts[new_idx] = new_host;
				
				var forward_loc = request.path + '/' + new_idx.toString();
				reply().header('Location', forward_loc).code(201);
				return;
			}
			catch(err) {
				reply('Host creation error:  ' + err).code(404);
				return;
			}
			
			reply().code(500);
		}
	},
	{
		method: 'PUT',
		path: '/host/{host}',
		handler: function (request, reply) {
			try {
			    var new_host = request.payload;

				if(!new_host.hasOwnProperty("id") ||
				   (!new_host.hasOwnProperty("name") && 
				    !new_host.hasOwnProperty("ipv4"))) {
				    reply().code(204);
					return;
				}
				
				for(var idx in hosts.hosts) {
					
					if(hosts.hosts[idx].id == request.params.host) {
                        if(new_host.hasOwnProperty("name"))
							hosts.hosts[idx].name = new_host.name;
						if(new_host.hasOwnProperty("ipv4"))
							hosts.hosts[idx].ipv4 = new_host.ipv4;

						reply().code(200);
						return;
					}	
				}
				
				reply('Host not found:  ' + err).code(404);
				return;
			}

			catch(err) {
				reply('Host modification error:  ' + err).code(404);
				return;
			}
			
			reply().code(500);
		}
	},
	{
		method: 'DELETE',
		path: '/host/{host}',
		handler: function (request, reply) {
			for(var idx in hosts.hosts) {
				var host = hosts.hosts[idx];
				if(host.id == request.params.host) {
					delete hosts.hosts[idx];
					reply().code(200);
					return;
				}
				    
			}
			
			reply('Host not found').code(404);
		}
	},
	{
		//This method takes an optional simple JSON array of indices [idx1, idx2]
		method: 'DELETE',
		path: '/hosts',
		handler: function (request, reply) {
			try {
				//In the case of no payload, delete them all
				if(!request.payload) {
					hosts.hosts = [];
					reply().code(200);
					return;
				}
				else {
					var host_list = request.payload;
					var deletions = 0;
					

					for(var idx=hosts.hosts.length - 1; idx >= 0; idx--){
	
						for(var delHost in host_list) {

							if(hosts.hosts[idx].id == host_list[delHost]) {
								
								delete hosts.hosts[idx];
								deletions++;
								break;
							}
						}
					}
					
					if(deletions > 0)
						reply().code(200);
					else
						reply('None of the requested hosts were on the server').code(404);
					
					return;
				}
            }
			catch(err) {
				reply('Error deleting multiple hosts:  ' + err).code(404);
				return;
			}
			
			reply().code(500);
		}
	},
];