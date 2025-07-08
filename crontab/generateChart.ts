
const fs = require('fs');
const path = require('path');
// Fonction pour générer le chart
export async function generateChart() {
    try {
        const response = await fetch('https://raise.logi-green.com/agent/chart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                source: 'cron-job'
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));

        // Vérifier si la réponse est OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Vérifier le type de contenu
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('image/png')) {
            // C'est une image PNG
            const buffer = await response.arrayBuffer();
            console.log(`Chart generated: ${buffer.byteLength} bytes`);

            // Créer le dossier /image s'il n'existe pas
            const imageDir = path.join(__dirname, 'image');
            if (!fs.existsSync(imageDir)) {
                fs.mkdirSync(imageDir, { recursive: true });
                console.log('Created directory:', imageDir);
            }

            // Créer le nom de fichier avec la date
            const now = new Date();
            const dateString = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const timeString = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); // Format: HH-MM-SS
            const filename = `chart_${dateString}_${timeString}.png`;
            const filepath = path.join(imageDir, filename);

            // Sauvegarder l'image
            fs.writeFileSync(filepath, Buffer.from(buffer));
            console.log(`Chart saved to: ${filepath}`);

        } else if (contentType && contentType.includes('application/json')) {
            // C'est du JSON (probablement une erreur)
            const data = await response.json();
            console.log('Chart generation response:', data);
        } else {
            // Autre type de contenu
            const text = await response.text();
            console.log('Chart generation completed (text response):', text);
        }

    } catch (error) {
        console.error('Chart generation failed:', error);
    }
}