
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
            const imageUrl = `https://raise.logi-green.com/log/image/${filename}`;
            const urlN8N = "https://n8n.srv753028.hstgr.cloud/webhook/0912f56b-4eaf-4ad4-a759-957082ee64bb";
            const htmlContent = `<img src="${imageUrl}" alt="Generated Chart" style="max-width: 100%; height: auto;">`;
            console.log('Sending webhook to n8n with image URL:', imageUrl);
            console.log('Webhook URL:', urlN8N);
            const bodyContent = {
                        response: htmlContent,
                    };
            console.log('Body content:', bodyContent);
            const webhookResponse = await fetch(
                urlN8N,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(bodyContent),
                },
            );
            if (!webhookResponse.ok) {
                throw new Error(`Webhook error! status: ${webhookResponse.status}`);
            }
            console.log('Webhook sent successfully to n8n');
            console.log('Webhook response status:', webhookResponse.status);
            console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers));
            console.log('Webhook response body:', await webhookResponse.text());
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