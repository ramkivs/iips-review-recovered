/** TEST-ONLY fresh-process HTTP host. No listener is introduced into the application. */
import http from 'node:http';
import { handleBrokerImportRequest } from '../brokerImportHttp.js';
const server = http.createServer((req, res) => { void handleBrokerImportRequest(req, res); });
server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  if (address && typeof address !== 'string') process.send?.({ port: address.port, pid: process.pid });
});
process.on('SIGTERM', () => { server.closeAllConnections(); server.close(() => process.exit(0)); });
