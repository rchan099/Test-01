'use strict';

let Hapi = require('hapi');
let Good = require('good');
let server = new Hapi.Server();
server.connection({ port: 3000 });

server.register(require('inert'), (err) => {
    if (err) {
        throw err;
    }

    server.route([
      {
          method: 'GET',
          path: '/hello',
          handler: (request, reply) => {
              reply.file('./public/hello.html');
          }
      },
      {
        method: 'GET',
        path: '/api/items',
        handler: (request, reply) => {
          reply('Get item id');
        }
      },
      {
        method: 'GET',
        path: '/api/items/{id}',
        handler: (request, reply) => {
          reply('Get item id: ' + request.params.id);
        }
      },
      {
        method: 'POST',
        path: '/api/items',
        handler: (request, reply) => {
          reply('Post item');
        }
      },
      {
        method: 'PUT',
        path: '/api/items/{id}',
        handler: (request, reply) => {
          reply('Put item id: ' + request.params.id);
        }
      },
      {
        method: 'DELETE',
        path: '/api/items/{id}',
        handler: (request, reply) => {
          reply('Delete item id: ' + request.params.id);
        }
      },
      {
        method: 'GET',
        path: '/',
        handler: (request, reply) => {
          reply('Hello world');
        }
      }
    ]);
});

server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, (err) => {
    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start(() => {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});

/*server.start(() => {
    console.log('Server running at:', server.info.uri);
});*/