import { PlaywrightCrawler, Dataset } from 'crawlee';
import { extractProfileData, smartScroll } from './extractor.js';
import { getAuthStatePath, hasValidSession } from './login.js';
import { saveProfileToDataset } from '../storage_lib/storage.js';
import { sendToN8n } from '../integrations/n8n.js';

/**
 * Main crawler function.
 * @param {string[]} urls 
 */
export async function runCrawler(urls) {
    if (!hasValidSession()) {
        throw new Error('No valid session found. Please login first.');
    }

    const crawler = new PlaywrightCrawler({
        // Launch context for session reuse
        launchContext: {
            userDataDir: getAuthStatePath(),
        },
        // Anti-bot: Random delays and human-like interactions
        maxRequestsPerCrawl: 10, // Safety limit
        requestHandlerTimeoutSecs: 180,
        
        async requestHandler({ page, request, log }) {
            log.info(`Processing URL: ${request.url}`);

            // Human-like delay
            const delay = Math.floor(Math.random() * 5000) + 2000;
            await page.waitForTimeout(delay);

            // Scroll to bottom to trigger all lazy loads
            log.info('Scrolling profile sections...');
            await smartScroll(page);
            
            // Extract data
            log.info('Extracting profile data...');
            const profileData = await extractProfileData(page);
            
            // Store results
            log.info('Saving results...');
            await saveProfileToDataset(profileData);
            
            // Integration: n8n Webhook
            log.info('Triggering n8n integration...');
            await sendToN8n(profileData);

            log.info(`Successfully scraped: ${profileData.fullName}`);
        },
        
        failedRequestHandler({ request, log }) {
            log.error(`Request ${request.url} failed after retries.`);
        },
    });

    await crawler.run(urls);
    
    // Return all data from the dataset
    const dataset = await Dataset.open();
    const { items } = await dataset.getData();
    return items;
}
