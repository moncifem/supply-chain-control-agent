import { generateChart } from "./generateChart";
import { getLogs } from "./log";

const cron = require('node-cron');
const http = require('http');
const url = require('url');

console.log('Starting cron job ...');

// Toutes les 7 jours (chaque dimanche à minuit)
cron.schedule('0 0 * * 0', generateChart);


// Serveur HTTP simple
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/getlogs' && req.method === 'GET') {
    const logs = await getLogs();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(logs));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Démarrer le serveur sur le port 3000
server.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Pour tester manuellement (optionnel)
// generateChart();