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
      const { stdout } = await execAsync(`docker logs --tail=1000 ${container}`);
      console.log(`=== Logs from ${container} ===`);
      console.log(stdout);
      console.log(`=== End logs from ${container} ===\n`);
      
      return [{ name: container, logs: stdout }];
    } catch (error) {
      console.error(`Error getting logs from ${container}:`, error.message);
      return [{ name: container, logs: `Error: ${error.message}` }];
    }
    
  } catch (error) {
    console.error('Error getting logs:', error);
    return [{ name: 'error', logs: `System error: ${error.message}` }];
  }
}