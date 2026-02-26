#!/usr/bin/env python3
"""
Backend API Testing Script for Society Management System
Tests all CRUD operations and authentication endpoints
"""

import requests
import json
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://community-hub-525.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {}
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL" 
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results[test_name] = {"success": success, "details": details}
        return success
    
    def test_login(self):
        """Test authentication endpoint"""
        try:
            url = f"{API_BASE}/auth/login"
            payload = {
                "userId": "admin001",
                "password": "admin123"
            }
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.auth_token = data['token']
                    self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
                    return self.log_result("Login Authentication", True, 
                        f"Token received, user: {data['user'].get('name', 'Unknown')}")
                else:
                    return self.log_result("Login Authentication", False, 
                        "Response missing token or user data")
            else:
                return self.log_result("Login Authentication", False, 
                    f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_result("Login Authentication", False, f"Exception: {str(e)}")
    
    def test_visitors_crud(self):
        """Test visitor CRUD operations"""
        try:
            # Test POST /api/visitors
            create_url = f"{API_BASE}/visitors"
            visitor_data = {
                "name": "John Doe",
                "mobile": "9876543210",
                "flatNumber": "A-101",
                "purpose": "Meeting with resident"
            }
            
            # Create visitor
            response = self.session.post(create_url, json=visitor_data)
            if response.status_code != 200:
                return self.log_result("Create Visitor", False, 
                    f"Create failed - HTTP {response.status_code}: {response.text}")
            
            visitor = response.json()
            if 'id' not in visitor:
                return self.log_result("Create Visitor", False, "Created visitor missing ID")
            
            visitor_id = visitor['id']
            self.log_result("Create Visitor", True, f"Created visitor with ID: {visitor_id}")
            
            # Test GET /api/visitors
            response = self.session.get(create_url)
            if response.status_code != 200:
                return self.log_result("Get Visitors", False, 
                    f"GET failed - HTTP {response.status_code}: {response.text}")
            
            visitors = response.json()
            if not isinstance(visitors, list):
                return self.log_result("Get Visitors", False, "Response is not an array")
            
            # Verify our created visitor is in the list
            created_visitor = next((v for v in visitors if v.get('id') == visitor_id), None)
            if not created_visitor:
                return self.log_result("Get Visitors", False, "Created visitor not found in list")
            
            return self.log_result("Get Visitors", True, 
                f"Retrieved {len(visitors)} visitors, including created one")
                
        except Exception as e:
            return self.log_result("Visitors CRUD", False, f"Exception: {str(e)}")
    
    def test_staff_crud(self):
        """Test staff CRUD operations"""
        try:
            # Test POST /api/staff
            create_url = f"{API_BASE}/staff"
            staff_data = {
                "name": "Security Guard",
                "role": "security",
                "mobile": "9876543211",
                "shift": "day",
                "salary": "15000"
            }
            
            # Create staff
            response = self.session.post(create_url, json=staff_data)
            if response.status_code != 200:
                return self.log_result("Create Staff", False, 
                    f"Create failed - HTTP {response.status_code}: {response.text}")
            
            staff = response.json()
            if 'id' not in staff:
                return self.log_result("Create Staff", False, "Created staff missing ID")
            
            staff_id = staff['id']
            self.log_result("Create Staff", True, f"Created staff with ID: {staff_id}")
            
            # Test GET /api/staff
            response = self.session.get(create_url)
            if response.status_code != 200:
                return self.log_result("Get Staff", False, 
                    f"GET failed - HTTP {response.status_code}: {response.text}")
            
            staff_list = response.json()
            if not isinstance(staff_list, list):
                return self.log_result("Get Staff", False, "Response is not an array")
            
            # Verify our created staff is in the list
            created_staff = next((s for s in staff_list if s.get('id') == staff_id), None)
            if not created_staff:
                return self.log_result("Get Staff", False, "Created staff not found in list")
            
            return self.log_result("Get Staff", True, 
                f"Retrieved {len(staff_list)} staff members, including created one")
                
        except Exception as e:
            return self.log_result("Staff CRUD", False, f"Exception: {str(e)}")
    
    def test_vendors_crud(self):
        """Test vendor CRUD operations"""
        try:
            # Test POST /api/vendors
            create_url = f"{API_BASE}/vendors"
            vendor_data = {
                "companyName": "Clean Services Ltd",
                "serviceType": "cleaning",
                "contactPerson": "Jane Smith",
                "mobile": "9876543212",
                "email": "jane@cleanservices.com"
            }
            
            # Create vendor
            response = self.session.post(create_url, json=vendor_data)
            if response.status_code != 200:
                return self.log_result("Create Vendor", False, 
                    f"Create failed - HTTP {response.status_code}: {response.text}")
            
            vendor = response.json()
            if 'id' not in vendor:
                return self.log_result("Create Vendor", False, "Created vendor missing ID")
            
            vendor_id = vendor['id']
            self.log_result("Create Vendor", True, f"Created vendor with ID: {vendor_id}")
            
            # Test GET /api/vendors
            response = self.session.get(create_url)
            if response.status_code != 200:
                return self.log_result("Get Vendors", False, 
                    f"GET failed - HTTP {response.status_code}: {response.text}")
            
            vendors = response.json()
            if not isinstance(vendors, list):
                return self.log_result("Get Vendors", False, "Response is not an array")
            
            # Verify our created vendor is in the list
            created_vendor = next((v for v in vendors if v.get('id') == vendor_id), None)
            if not created_vendor:
                return self.log_result("Get Vendors", False, "Created vendor not found in list")
            
            return self.log_result("Get Vendors", True, 
                f"Retrieved {len(vendors)} vendors, including created one")
                
        except Exception as e:
            return self.log_result("Vendors CRUD", False, f"Exception: {str(e)}")
    
    def test_notices_crud(self):
        """Test notice CRUD operations"""
        try:
            # Test POST /api/notices
            create_url = f"{API_BASE}/notices"
            notice_data = {
                "title": "Important Notice",
                "content": "This is an important notice for all residents regarding maintenance work.",
                "priority": "normal"
            }
            
            # Create notice
            response = self.session.post(create_url, json=notice_data)
            if response.status_code != 200:
                return self.log_result("Create Notice", False, 
                    f"Create failed - HTTP {response.status_code}: {response.text}")
            
            notice = response.json()
            if 'id' not in notice:
                return self.log_result("Create Notice", False, "Created notice missing ID")
            
            notice_id = notice['id']
            self.log_result("Create Notice", True, f"Created notice with ID: {notice_id}")
            
            # Test GET /api/notices
            response = self.session.get(create_url)
            if response.status_code != 200:
                return self.log_result("Get Notices", False, 
                    f"GET failed - HTTP {response.status_code}: {response.text}")
            
            notices = response.json()
            if not isinstance(notices, list):
                return self.log_result("Get Notices", False, "Response is not an array")
            
            # Verify our created notice is in the list
            created_notice = next((n for n in notices if n.get('id') == notice_id), None)
            if not created_notice:
                return self.log_result("Get Notices", False, "Created notice not found in list")
            
            return self.log_result("Get Notices", True, 
                f"Retrieved {len(notices)} notices, including created one")
                
        except Exception as e:
            return self.log_result("Notices CRUD", False, f"Exception: {str(e)}")
    
    def test_complaints_crud(self):
        """Test complaint CRUD operations"""
        try:
            # Test POST /api/complaints
            create_url = f"{API_BASE}/complaints"
            complaint_data = {
                "title": "Water Leakage Issue",
                "description": "Water is leaking from the pipe in the common area",
                "category": "Plumbing",
                "flatNumber": "A-101",
                "priority": "high",
                "contactName": "Resident Name",
                "contactMobile": "9876543213"
            }
            
            # Create complaint
            response = self.session.post(create_url, json=complaint_data)
            if response.status_code != 200:
                return self.log_result("Create Complaint", False, 
                    f"Create failed - HTTP {response.status_code}: {response.text}")
            
            complaint = response.json()
            if 'id' not in complaint:
                return self.log_result("Create Complaint", False, "Created complaint missing ID")
            
            complaint_id = complaint['id']
            self.log_result("Create Complaint", True, f"Created complaint with ID: {complaint_id}")
            
            # Test GET /api/complaints
            response = self.session.get(create_url)
            if response.status_code != 200:
                return self.log_result("Get Complaints", False, 
                    f"GET failed - HTTP {response.status_code}: {response.text}")
            
            complaints = response.json()
            if not isinstance(complaints, list):
                return self.log_result("Get Complaints", False, "Response is not an array")
            
            # Verify our created complaint is in the list
            created_complaint = next((c for c in complaints if c.get('id') == complaint_id), None)
            if not created_complaint:
                return self.log_result("Get Complaints", False, "Created complaint not found in list")
            
            return self.log_result("Get Complaints", True, 
                f"Retrieved {len(complaints)} complaints, including created one")
                
        except Exception as e:
            return self.log_result("Complaints CRUD", False, f"Exception: {str(e)}")
    
    def test_announcements_crud(self):
        """Test announcement CRUD operations"""
        try:
            # Test POST /api/announcements
            create_url = f"{API_BASE}/announcements"
            announcement_data = {
                "title": "Society Event Announcement",
                "content": "We are organizing a cultural event next weekend. All residents are invited.",
                "type": "general"
            }
            
            # Create announcement
            response = self.session.post(create_url, json=announcement_data)
            if response.status_code != 200:
                return self.log_result("Create Announcement", False, 
                    f"Create failed - HTTP {response.status_code}: {response.text}")
            
            announcement = response.json()
            if 'id' not in announcement:
                return self.log_result("Create Announcement", False, "Created announcement missing ID")
            
            announcement_id = announcement['id']
            self.log_result("Create Announcement", True, f"Created announcement with ID: {announcement_id}")
            
            # Test GET /api/announcements
            response = self.session.get(create_url)
            if response.status_code != 200:
                return self.log_result("Get Announcements", False, 
                    f"GET failed - HTTP {response.status_code}: {response.text}")
            
            announcements = response.json()
            if not isinstance(announcements, list):
                return self.log_result("Get Announcements", False, "Response is not an array")
            
            # Verify our created announcement is in the list
            created_announcement = next((a for a in announcements if a.get('id') == announcement_id), None)
            if not created_announcement:
                return self.log_result("Get Announcements", False, "Created announcement not found in list")
            
            return self.log_result("Get Announcements", True, 
                f"Retrieved {len(announcements)} announcements, including created one")
                
        except Exception as e:
            return self.log_result("Announcements CRUD", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("SOCIETY MANAGEMENT SYSTEM - BACKEND API TESTING")
        print("=" * 60)
        print(f"Base URL: {BASE_URL}")
        print(f"API Base: {API_BASE}")
        print("-" * 60)
        
        # Test authentication first
        if not self.test_login():
            print("\n❌ AUTHENTICATION FAILED - Cannot proceed with other tests")
            return False
        
        print("-" * 60)
        
        # Test all CRUD operations
        tests = [
            self.test_visitors_crud,
            self.test_staff_crud,
            self.test_vendors_crud,
            self.test_notices_crud,
            self.test_complaints_crud,
            self.test_announcements_crud
        ]
        
        for test in tests:
            test()
            print("-" * 30)
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results.values() if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
        else:
            print("\n⚠️  Some tests failed. Check the details above.")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)