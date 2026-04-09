# LinkedIn Scraper with API Fallback

This project provides a comprehensive REST API for scraping LinkedIn company and profile data, with automatic API fallback for missing information.

## Features

- **REST API**: Complete RESTful API with proper error handling
- **Hybrid Approach**: First attempts to scrape data from LinkedIn pages
- **API Fallback**: Uses LinkedIn API for any data that couldn't be scraped
- **Complete Data**: Ensures you get the most comprehensive data possible
- **Rate Limiting**: Built-in delays to respect LinkedIn's terms of service
- **Multiple Formats**: Support for JSON responses and Excel exports
- **File Upload**: Upload files containing URLs for batch processing
- **Automatic File Storage**: All results are automatically saved to JSON files
- **File Management**: List and cleanup stored result files

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **LinkedIn API Setup** (Optional but recommended):
   - Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
   - Create an app and get your API key
   - Copy `.env.example` to `.env`
   - Add your API key: `LINKEDIN_API_KEY=your_actual_api_key`

3. **Run the Application**:
   ```bash
   python app.py
   ```

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /status` - API status and configuration
- `GET /version` - API version information
- `GET /api/docs` - API documentation
- `GET /results` - List saved result files
- `GET /` - Web interface for manual testing

### Scraping Endpoints
- `POST /scrape-profile` - Scrape a single profile or company
- `POST /scrape-bulk` - Scrape multiple profiles/companies
- `POST /download-excel` - Export results to Excel
- `POST /upload-urls` - Upload file with URLs to scrape
- `POST /cleanup` - Clean up old result files

## How It Works

1. **Scraping First**: The scraper attempts to extract basic profile data from LinkedIn pages
2. **API Priority for Key Fields**: For Current Position, Connections, and Education, the system directly uses the LinkedIn API (if configured)
3. **Complete Data**: Ensures you get accurate data for the most important fields

## API Endpoints Used

- `GET /v2/people/{id}` - For basic profile info and connections
- `GET /v2/people/{id}/positions` - For current position data
- `GET /v2/people/{id}/educations` - For education history

## Data Fields

### Profile Data (API Priority Fields)
- **Current Position** - Fetched from LinkedIn API
- **Current Company** - Fetched from LinkedIn API
- **Connections** - Fetched from LinkedIn API
- **Education** - Fetched from LinkedIn API

### Profile Data (Scraping Fallback)
- Full Name, Headline, Location
- About, Profile Picture

## Testing the API

Run the test script to validate all endpoints:

```bash
python test_api.py
```

## File Storage

All successful scraping operations automatically save results to JSON files in the `results/` directory for persistence and later retrieval.

### File Management
- **View saved files**: `GET /results` endpoint
- **Clean up old files**: `POST /cleanup` endpoint
- **Direct access**: Files are stored locally and can be accessed directly

### File Naming
- Profile scrapes: `profile_{username}_{timestamp}.json`
- Company scrapes: `company_{slug}_{timestamp}.json`
- Bulk operations: `bulk_scraping_{timestamp}.json`
- File uploads: `file_upload_{timestamp}.json`

## Important Notes

- **API Key Required**: Without an API key, only scraping will be used
- **Rate Limits**: Both scraping and API calls have rate limits
- **Terms of Service**: Ensure compliance with LinkedIn's terms
- **Data Privacy**: Only scrape public data and respect privacy
- **Manual URLs**: You must provide your own LinkedIn URLs - no test URLs are included

## API Documentation

Complete API documentation is available at `GET /api/docs` when the server is running, or view `API_DOCUMENTATION.md`.