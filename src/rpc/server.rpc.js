const RPC = require('@hyperswarm/rpc');

class RpcServer {
  constructor(dht, rpcSeed) {
    this.rpc = new RPC({ dht, seed: rpcSeed });
    this.options = {}; // Route registry
  }

  registerRoute(routeName, handler) {
    this.options[routeName] = handler;
  }

  async handler(routeName, reqRaw) {
    try {
      const req = JSON.parse(reqRaw.toString('utf-8'));
      const handler = this.options[routeName];
      if (!handler) {
        throw new Error(`No handler found for route: ${routeName}`);
      }
      const result = await handler(req);
      return Buffer.from(JSON.stringify(result));
    } catch (error) {
      console.error(`Error in route "${routeName}":`, error.message);
      return Buffer.from(JSON.stringify({ error: error.message }));
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
