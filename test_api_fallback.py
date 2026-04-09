#!/usr/bin/env python3
"""
Test script to demonstrate LinkedIn scraper with API fallback
"""

import os
from app import scrape_company, scrape_user, LINKEDIN_API_KEY

def test_api_fallback():
    """Test the API fallback functionality"""

    print("=== LinkedIn Scraper with API Fallback Test ===\n")

    # Check if API key is configured
    if LINKEDIN_API_KEY:
        print(f"✅ LinkedIn API key configured: {LINKEDIN_API_KEY[:10]}...")
    else:
        print("⚠️  No LinkedIn API key configured - only scraping will be used")
        print("   To enable API fallback, set LINKEDIN_API_KEY in your .env file\n")

    print("📝 To test scraping, use the web interface at http://localhost:3000")
    print("   or call the API endpoints with your own LinkedIn URLs:")
    print("   - POST /scrape-profile with a LinkedIn profile/company URL")
    print("   - POST /scrape-bulk with a list of URLs")
    print("   - POST /upload-urls with a file containing URLs\n")

    print("🔧 Example API calls:")
    print("   curl -X POST http://localhost:3000/scrape-profile \\")
    print("        -H 'Content-Type: application/json' \\")
    print("        -d '{\"url\": \"YOUR_LINKEDIN_URL_HERE\"}'\n")

    print("⚠️  Note: Replace YOUR_LINKEDIN_URL_HERE with actual LinkedIn URLs")
    print("   Only public LinkedIn profiles and companies can be scraped")

    print("=== Test Complete ===")
    print("\nTo enable API fallback:")
    print("1. Get a LinkedIn API key from https://developer.linkedin.com/")
    print("2. Create a .env file with: LINKEDIN_API_KEY=your_key_here")
    print("3. Restart the application")
    print("\nTo test scraping:")
    print("1. Start the server: python app.py")
    print("2. Open http://localhost:3000 in your browser")
    print("3. Enter your own LinkedIn URLs to scrape")

if __name__ == "__main__":
    test_api_fallback()