import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends extracted profile data to n8n webhook.
 * @param {object} data 
 */
export async function sendToN8n(data) {
    const webhookUrl = process.env.N8N_WEB_HOOK_URL;
    if (!webhookUrl) {
        console.log('n8n webhook URL not configured. Skipping integration.');
        return false;
    }

    try {
        console.log(`Sending data to n8n: ${webhookUrl}`);
        const response = await axios.post(webhookUrl, data);
        console.log(`n8n response: ${response.status} ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error sending to n8n:', error.message);
        return false;
    }
}
