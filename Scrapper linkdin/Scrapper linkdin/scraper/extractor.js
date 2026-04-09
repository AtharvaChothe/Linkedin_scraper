/**
 * Advanced Extractor module for LinkedIn profiles.
 * This contains robust selectors and logic to click "See more" buttons.
 */

/**
 * Click "See more" buttons in all visible sections.
 * @param {import('playwright').Page} page 
 */
export async function expandSections(page) {
    const seeMoreSelectors = [
        'button.inline-show-more-text__button',
        'button.pv-profile-section__see-more-button',
        '#about + .display-flex + .inline-show-more-text button',
        '.pv-experience-section__see-more-button',
        '.pv-education-section__see-more-button'
    ];

    for (const selector of seeMoreSelectors) {
        try {
            const buttons = await page.$$(selector);
            for (const button of buttons) {
                if (await button.isVisible()) {
                    await button.click();
                    await page.waitForTimeout(500); // Wait for content expansion
                }
            }
        } catch (e) {
            // Ignore if button not found or not clickable
        }
    }
}

/**
 * Perform a deep human-like scroll and expand sections.
 * @param {import('playwright').Page} page 
 */
export async function smartScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 150;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
    // After scrolling, try to expand sections
    await expandSections(page);
}

/**
 * Extracts profile data with improved selectors.
 * @param {import('playwright').Page} page 
 */
export async function extractProfileData(page) {
    // Wait for the main profile section with multiple fallbacks
    await page.waitForSelector('.pv-top-card, #profile-content', { timeout: 30000 });

    const data = await page.evaluate(() => {
        const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.innerText.trim() : '';
        };

        const getAllFromSection = (sectionId, itemSelector, mappingFn) => {
            const section = document.querySelector(`#${sectionId}`);
            if (!section) return [];
            
            // Find the list container next to the ID anchor
            const container = section.closest('section')?.querySelector('ul');
            if (!container) return [];

            return Array.from(container.querySelectorAll(itemSelector))
                .map(mappingFn)
                .filter(res => res !== null);
        };

        // Robust selectors for top card
        const fullName = getText('h1.text-heading-xlarge') || getText('.pv-top-card--list li:first-child');
        const headline = getText('.text-body-medium.break-words') || getText('.pv-top-card--list li:nth-child(2)');
        const location = getText('.text-body-small.inline.t-black--light.break-words');
        const about = getText('#about + .display-flex + .inline-show-more-text') || getText('section.pv-about-section p');
        
        // Experience
        const experience = getAllFromSection('experience', 'li.pvs-list__paged-list-item, li.pv-profile-section__list-item', (item) => {
            const title = item.querySelector('[data-field="experience_company_title"] div span, .pv-entity__summary-info h3')?.innerText?.trim() || 
                           item.querySelector('.mr1.t-bold span')?.innerText?.trim();
            const company = item.querySelector('.t-14.t-normal span, .pv-entity__secondary-title')?.innerText?.trim();
            const dateRange = item.querySelector('.t-14.t-normal.t-black--light span, .pv-entity__date-range span:nth-child(2)')?.innerText?.trim();
            const description = item.querySelector('.inline-show-more-text span')?.innerText?.trim();
            
            return (title || company) ? { title, company, dateRange, description } : null;
        });

        // Education
        const education = getAllFromSection('education', 'li.pvs-list__paged-list-item, li.pv-profile-section__list-item', (item) => {
            const school = item.querySelector('.mr1.t-bold span, .pv-entity__school-name')?.innerText?.trim();
            const degree = item.querySelector('.t-14.t-normal span, .pv-entity__degree-name span:nth-child(2)')?.innerText?.trim();
            const dateRange = item.querySelector('.t-14.t-normal.t-black--light span, .pv-entity__dates span:nth-child(2)')?.innerText?.trim();
            return school ? { school, degree, dateRange } : null;
        });

        // Skills
        const skills = Array.from(document.querySelectorAll('#skills + .display-flex + div ul li span[aria-hidden="true"], .pv-skill-category-entity__name-text'))
            .map(el => el.innerText.trim())
            .filter((text, index, self) => text.length > 0 && self.indexOf(text) === index);

        return {
            fullName,
            headline,
            location,
            about,
            experience,
            education,
            skills,
            profileUrl: window.location.href,
            scrapedAt: new Date().toISOString()
        };
    });

    return data;
}
