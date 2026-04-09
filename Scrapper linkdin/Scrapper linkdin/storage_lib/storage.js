import { Dataset } from 'crawlee';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

/**
 * Saves a single profile to the default dataset.
 * @param {object} profile 
 */
export async function saveProfileToDataset(profile) {
    await Dataset.pushData(profile);
}

/**
 * Returns all profiles from the default dataset.
 */
export async function getAllProfiles() {
    const dataset = await Dataset.open();
    const { items } = await dataset.getData();
    return items;
}

/**
 * Exports data to CSV.
 * @param {Array} data 
 * @returns {string} Path to the CSV file.
 */
export async function exportToCsv(data) {
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    const csvPath = path.join(exportDir, `profiles_${Date.now()}.csv`);
    const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: [
            { id: 'fullName', title: 'Full Name' },
            { id: 'headline', title: 'Headline' },
            { id: 'location', title: 'Location' },
            { id: 'about', title: 'About' },
            { id: 'experience', title: 'Experience' },
            { id: 'education', title: 'Education' },
            { id: 'skills', title: 'Skills' },
            { id: 'profileUrl', title: 'URL' },
        ]
    });

    // Format experience/education/skills as strings for CSV
    const formattedData = data.map(item => ({
        ...item,
        experience: JSON.stringify(item.experience),
        education: JSON.stringify(item.education),
        skills: item.skills.join(', ')
    }));

    await csvWriter.writeRecords(formattedData);
    return csvPath;
}

/**
 * Exports data to JSON.
 * @param {Array} data 
 * @returns {string} Path to the JSON file.
 */
export async function exportToJson(data) {
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    const jsonPath = path.join(exportDir, `profiles_${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    return jsonPath;
}
