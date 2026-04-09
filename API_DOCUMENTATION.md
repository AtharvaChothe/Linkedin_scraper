# LinkedIn Scraper REST API Documentation

## Overview
This REST API provides LinkedIn data scraping capabilities with automatic API fallback for enhanced data completeness.

## Base URL
```
http://localhost:3000
```

## Authentication
Currently no authentication required. For production use, consider adding API keys.

## Endpoints

### GET /
Returns the web interface for manual testing.

**Response:** HTML page

---

### GET /health
Health check endpoint to verify API status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

---

### GET /api/docs
Returns this API documentation.

**Response:** This markdown documentation

---

### POST /scrape-profile
Scrape a single LinkedIn profile or company.

**Request Body:**
```json
{
  "url": "https://www.linkedin.com/in/your-profile"
}
```

**Response:**
```json
[
  {
    "Full Name": "John Doe",
    "Headline": "Software Engineer at Company",
    "Location": "San Francisco, CA",
    "About": "Experienced developer...",
    "Current Position": "Software Engineer",
    "Current Company": "Tech Corp",
    "Connections": "500+",
    "Education": "Stanford University, BS Computer Science",
    "LinkedIn URL": "https://www.linkedin.com/in/your-profile"
  }
]
```

**Note:** Results are automatically saved to `results/profile_{identifier}_{timestamp}.json`

**Error Response:**
```json
{
  "error": "URL required"
}
```

---

### POST /scrape-bulk
Scrape multiple LinkedIn profiles or companies.

**Request Body:**
```json
{
  "urls": [
    "https://www.linkedin.com/in/profile1",
    "https://www.linkedin.com/company/company1"
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "Full Name": "John Doe",
      "Headline": "Software Engineer",
      // ... profile data
    }
  ],
  "errors": [
    {
      "url": "https://invalid-url.com",
      "error": "Must be /company/ or /in/ URL"
    }
  ],
  "saved_to_file": true,
  "file_path": "/path/to/results/bulk_scraping_20240101_120000.json",
  "total_processed": 2,
  "successful": 1,
  "failed": 1
}
```

---

### POST /download-excel
Export scraped data to Excel format.

**Request Body:**
```json
{
  "results": [
    {
      "Full Name": "John Doe",
      "Headline": "Software Engineer",
      // ... data fields
    }
  ]
}
```

**Response:** Excel file download

---

### POST /upload-urls
Upload a file containing URLs to scrape.

**Content-Type:** multipart/form-data

**Form Data:**
- `file`: Excel (.xlsx/.xls) or text file with URLs

**Response:**
```json
{
  "results": [
    {
      "Full Name": "John Doe",
      // ... scraped data
    }
  ],
  "errors": [
    {
      "url": "invalid-url",
      "error": "Must be /company/ or /in/ URL"
    }
  ],
  "saved_to_file": true,
  "file_path": "/path/to/results/file_upload_20240101_120000.json",
  "total_processed": 2,
  "successful": 1,
  "failed": 1,
  "source_file": "urls.xlsx"
}
```

---

### GET /status
Get API status and configuration information.

**Response:**
```json
{
  "status": "running",
  "api_key_configured": true,
  "version": "1.0.0",
  "results_directory": "/path/to/results",
  "saved_result_files": 5,
  "endpoints": [
    "/",
    "/health",
    "/status",
    "/version",
    "/api/docs",
    "/results",
    "/scrape-profile",
    "/scrape-bulk",
    "/download-excel",
    "/upload-urls",
    "/cleanup"
  ]
}
```

## File Storage

All successful scraping operations automatically save results to JSON files in the `results/` directory:

- **Single Profile**: `results/profile_{identifier}_{timestamp}.json`
- **Bulk Scraping**: `results/bulk_scraping_{timestamp}.json`
- **File Upload**: `results/file_upload_{timestamp}.json`

### File Naming Convention
- Profile files: `profile_{linkedin_username}_{YYYYMMDD_HHMMSS}.json`
- Company files: `company_{company_slug}_{YYYYMMDD_HHMMSS}.json`
- Bulk operations: `bulk_scraping_{YYYYMMDD_HHMMSS}.json`
- File uploads: `file_upload_{YYYYMMDD_HHMMSS}.json`

### Managing Stored Files
- **List files**: `GET /results` - View all saved result files
- **Cleanup old files**: `POST /cleanup` - Remove files older than specified days
- **Manual management**: Files are stored in the `results/` directory and can be accessed directly

## Data Fields

### Profile Data
- **Full Name**: Person's full name
- **Headline**: Professional headline
- **Location**: Geographic location
- **About**: Profile summary
- **Current Position**: Current job title (API priority)
- **Current Company**: Current employer (API priority)
- **Connections**: Number of connections (API priority)
- **Education**: Educational background (API priority)
- **LinkedIn URL**: Profile URL

### Company Data
- **Company Name**: Organization name
- **Tagline**: Company tagline
- **Overview**: Company description
- **Website**: Company website
- **Industry**: Industry classification
- **Company Size**: Employee count range
- **Headquarters**: Headquarters location
- **Founded**: Founding year
- **Type**: Organization type
- **Specialties**: Company specialties

## Error Codes
- `400`: Bad Request - Invalid input
- `500`: Internal Server Error - Scraping/API failure

## Rate Limiting
- Built-in delays between requests
- Respects LinkedIn's terms of service
- Google search rate limiting for employee discovery

## Configuration
Set environment variables:
- `LINKEDIN_API_KEY`: LinkedIn API key for enhanced data (optional)

## Usage Examples

### Python
```python
import requests

# Single profile
response = requests.post('http://localhost:3000/scrape-profile',
                        json={'url': 'https://www.linkedin.com/in/your-profile'})
data = response.json()

# Bulk scraping
response = requests.post('http://localhost:3000/scrape-bulk',
                        json={'urls': ['https://www.linkedin.com/in/profile1', 'https://www.linkedin.com/company/company1']})
data = response.json()
```

### JavaScript
```javascript
// Single profile
fetch('http://localhost:3000/scrape-profile', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({url: 'https://www.linkedin.com/in/your-profile'})
})
.then(res => res.json())
.then(data => console.log(data));

// Bulk scraping
fetch('http://localhost:3000/scrape-bulk', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({urls: ['https://www.linkedin.com/in/profile1', 'https://www.linkedin.com/company/company1']})
})
.then(res => res.json())
.then(data => console.log(data));
```

### GET /results
List all saved result files with metadata.

**Response:**
```json
{
  "total_files": 5,
  "results_directory": "/path/to/results",
  "files": [
    {
      "filename": "profile_johndoe_20240101_120000.json",
      "filepath": "/path/to/results/profile_johndoe_20240101_120000.json",
      "size": 2048,
      "created": "2024-01-01T12:00:00",
      "modified": "2024-01-01T12:00:00"
    }
  ]
}
```

---

### POST /cleanup
Clean up old result files older than specified days.

**Request Body:**
```json
{
  "max_age_days": 7
}
```

**Response:**
```json
{
  "message": "Cleaned up 3 old result files",
  "max_age_days": 7,
  "results_directory": "/path/to/results"
}
```</content>
<parameter name="filePath">c:\Users\athar\Downloads\Linkedin project tejaswini\Linkedin project\Linkedin scraper project\API_DOCUMENTATION.md