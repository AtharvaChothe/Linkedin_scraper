import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const AUTH_STATE_PATH = path.join(process.cwd(), 'storage', 'auth_state.json');

/**
 * Ensures the storage directory exists.
 */
function ensureStorageDir() {
    const dir = path.join(process.cwd(), 'storage');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Logs in to LinkedIn and saves the authentication state.
 * @param {string} email 
 * @param {string} password 
 */
export async function loginToLinkedIn(email, password) {
    ensureStorageDir();
    
    console.log('Starting login process...');
    const browser = await chromium.launch({ headless: false }); // Headful for potential 2FA
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/login');
    
    await page.fill('#username', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation after login...');
    // Wait for the feed or a similar logged-in indicator
    await page.waitForURL(/linkedin\.com\/feed/, { timeout: 60000 });

    console.log('Login successful. Saving auth state...');
    await context.storageState({ path: AUTH_STATE_PATH });

    await browser.close();
    return true;
}

/**
 * Checks if a valid session exists.
 */
export function hasValidSession() {
    return fs.existsSync(AUTH_STATE_PATH);
}

/**
 * Returns the path to the auth state file.
 */
export function getAuthStatePath() {
    return AUTH_STATE_PATH;
}
