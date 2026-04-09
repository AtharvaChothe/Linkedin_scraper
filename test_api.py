#!/usr/bin/env python3
"""
API Test Script for LinkedIn Scraper REST API
Tests all endpoints to ensure they work correctly
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:3000"

def test_endpoint(method, endpoint, data=None, files=None, expected_status=200, description=""):
    """Test a single endpoint"""
    print(f"\n🧪 Testing {method} {endpoint}")
    if description:
        print(f"   {description}")

    try:
        if method.upper() == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        elif method.upper() == "POST":
            if files:
                response = requests.post(f"{BASE_URL}{endpoint}", files=files, timeout=30)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=30)
        else:
            print(f"   ❌ Unsupported method: {method}")
            return False

        if response.status_code == expected_status:
            print(f"   ✅ Status: {response.status_code}")
            try:
                json_data = response.json()
                if isinstance(json_data, dict) and "error" in json_data:
                    print(f"   ⚠️  API returned error: {json_data['error']}")
                else:
                    print("   ✅ Valid JSON response")
                return True
            except:
                content_type = response.headers.get('content-type', '')

                if content_type.startswith('text/markdown'):
                    print("   ✅ Markdown documentation returned")
                    return True
                elif 'spreadsheet' in content_type:
                    print("   ✅ Excel file returned")
                    return True
                else:
                    print(f"   ✅ Response: {response.text[:100]}...")
                    return True
        else:
            print(f"   ❌ Expected status {expected_status}, got {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False


def run_api_tests():
    """Run all API endpoint tests"""
    print("🚀 LinkedIn Scraper API Test Suite")
    print("=" * 50)

    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(2)

    tests_passed = 0
    total_tests = 0

    # Test endpoints
    tests = [
        ("GET", "/health", None, 200, "Health check endpoint"),
        ("GET", "/status", None, 200, "API status and configuration"),
        ("GET", "/version", None, 200, "API version information"),
        ("GET", "/api/docs", None, 200, "API documentation"),
        ("POST", "/scrape-profile", {}, 400, "Invalid profile request (missing URL)"),
        ("POST", "/scrape-profile", {"url": "https://invalid-url.com"}, 400, "Invalid LinkedIn URL"),
        ("POST", "/scrape-bulk", {}, 400, "Invalid bulk request (missing URLs)"),
        ("POST", "/download-excel", {}, 400, "Invalid Excel request (no data)"),
        ("POST", "/upload-urls", None, 400, "Invalid upload request (no file)"),
        ("GET", "/", None, 200, "Web interface"),
    ]

    for method, endpoint, data, expected_status, desc in tests:
        total_tests += 1
        if test_endpoint(method, endpoint, data=data, expected_status=expected_status, description=desc):
            tests_passed += 1

    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")

    if tests_passed == total_tests:
        print("🎉 All tests passed! API is working correctly.")
        return True
    else:
        print(f"⚠️  {total_tests - tests_passed} tests failed.")
        return False


if __name__ == "__main__":
    success = run_api_tests()
    sys.exit(0 if success else 1)