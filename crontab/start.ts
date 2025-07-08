import { generateChart } from "./generateChart";
import { getLogs } from "./log";
import { serveStaticFile } from "./serveImage";

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
  }
  else if (parsedUrl.pathname === '/agent/chart' && req.method === 'GET') {
    try {
      await generateChart();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Chart generated successfully' }));
    } catch (error) {
      console.error('Error generating chart:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to generate chart' }));
    }
  }
  else if (parsedUrl.pathname?.startsWith('/image/') && req.method === 'GET') {
    const filename = parsedUrl.pathname.replace('/image/', '');
    const filePath = path.join(__dirname, 'image', filename);
    
    // Vérifier que le fichier est dans le dossier image (sécurité)
    const imageDir = path.join(__dirname, 'image');
    const resolvedPath = path.resolve(filePath);
    
    if (resolvedPath.startsWith(imageDir)) {
      serveStaticFile(filePath, res);
    } else {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Démarrer le serveur sur le port 3000
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
// generateChart();
// Pour tester manuellement (optionnel)
// generateChart();