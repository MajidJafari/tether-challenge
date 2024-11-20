const RPC = require('@hyperswarm/rpc');

class RpcServer {
  constructor(dht, rpcSeed) {
    this.rpc = new RPC({ dht, seed: rpcSeed });
    this.options = {};
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  // For simplicity we are skipping all middlewares but it can be a list of middlewares that needs to be skipped
  registerRoute(routeName, handler, skipMiddlewares = false) {
    this.options[routeName] = { handler, skipMiddlewares };
  }

  async handler(routeName, reqRaw) {
    try {
      const req = JSON.parse(reqRaw.toString('utf-8'));

      const route = this.options[routeName];

      if (!route.skipMiddlewares) {
        for (const middleware of this.middlewares) {
          await middleware(req);
        }
      }

      if (!route) throw new Error(`No handler found for route: ${routeName}`);
      const result = await route.handler(req);
      return Buffer.from(JSON.stringify(result)); // Return the response as a Buffer
    } catch (error) {
      console.error(`Error in route "${routeName}":`, error.message);
      return Buffer.from(JSON.stringify({ error: error.message })); // Return error as a Buffer
    }
  }

  async listen() {
    const server = this.rpc.createServer();

    Object.keys(this.options).forEach((routeName) => {
      server.respond(routeName, this.handler.bind(this, routeName));
    });

    await server.listen();
    console.log(
      'RPC server is listening on public key:',
      server.publicKey.toString('hex'),
    );
  }
}

module.exports = RpcServer;
