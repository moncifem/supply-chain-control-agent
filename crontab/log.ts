async function getLogs() {
  try {
    // Récupérer les logs du conteneur appCT
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const containers = ['appCT', 'agentCT', 'appMysql'];
    
    for (const container of containers) {
      try {
        const { stdout } = await execAsync(`docker logs --tail=100 ${container}`);
        console.log(`=== Logs from ${container} ===`);
        console.log(stdout);
        console.log(`=== End logs from ${container} ===\n`);
      } catch (error) {
        console.error(`Error getting logs from ${container}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error getting logs:', error);
  }
}