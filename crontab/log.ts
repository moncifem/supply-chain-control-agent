export type logEntry = {
  name: string;
  logs: string;
};

export async function getLogs() {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const container = 'agentCT';
    
    try {
      // Récupérer les logs et les inverser pour avoir le plus récent en premier
      const { stdout } = await execAsync(`docker logs --tail=1000 ${container}`);
      
      // Inverser l'ordre des lignes pour avoir le plus récent en premier
      const reversedLogs = stdout
        .split('\n')
        .reverse()
        .join('\n');
      
      return [{ name: container, logs: reversedLogs }];
    } catch (error) {
      console.error(`Error getting logs from ${container}:`, error.message);
      return [{ name: container, logs: `Error: ${error.message}` }];
    }
    
  } catch (error) {
    console.error('Error getting logs:', error);
    return [{ name: 'error', logs: `System error: ${error.message}` }];
  }
}