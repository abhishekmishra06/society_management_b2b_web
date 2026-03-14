#!/usr/bin/env python3
"""
Society Management System Backend Test - Express.js on port 5000
Tests the 29-step test flow as specified in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5001"
SUPER_ADMIN_USER_ID = "admin001"
SUPER_ADMIN_PASSWORD = "admin123"

class TestResults:
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.results = []
        self.auth_token = None
        self.society_id = None
        self.society_admin_credentials = None
        self.society_admin_token = None

    def log_test(self, step, test_name, success, message, response_data=None):
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            print(f"✅ Step {step}: {test_name} - {message}")
        else:
            self.failed_tests += 1
            print(f"❌ Step {step}: {test_name} - {message}")
        
        self.results.append({
            'step': step,
            'test_name': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })

    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"BACKEND TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        
        if self.failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  - Step {result['step']}: {result['test_name']} - {result['message']}")

def make_request(method, endpoint, data=None, headers=None, params=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, params=params, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, params=params, timeout=10)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, params=params, timeout=10)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, params=params, timeout=10)
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_society_management_system():
    """Execute the complete 29-step test flow"""
    test_results = TestResults()
    
    print("Starting Society Management System Backend Tests...")
    print(f"Testing backend at: {BASE_URL}")
    print(f"{'='*60}")
    
    # Step 1: Health check
    try:
        response = make_request('GET', '/api/health')
        if response and response.status_code == 200:
            health_data = response.json()
            test_results.log_test(1, "Health Check", True, 
                f"Backend healthy - {health_data.get('message', 'OK')}", health_data)
        else:
            test_results.log_test(1, "Health Check", False, 
                f"Health check failed - Status: {response.status_code if response else 'No response'}")
            return test_results
    except Exception as e:
        test_results.log_test(1, "Health Check", False, f"Health check failed: {str(e)}")
        return test_results
    
    # Step 2: Login as Super Admin
    try:
        login_data = {
            "userId": SUPER_ADMIN_USER_ID,
            "password": SUPER_ADMIN_PASSWORD
        }
        response = make_request('POST', '/api/auth/login', login_data)
        if response and response.status_code == 200:
            login_response = response.json()
            test_results.auth_token = login_response.get('token')
            user_data = login_response.get('user', {})
            test_results.log_test(2, "Super Admin Login", True, 
                f"Login successful - Role: {user_data.get('role')}, Token received", 
                {'role': user_data.get('role'), 'userId': user_data.get('userId')})
        else:
            test_results.log_test(2, "Super Admin Login", False, 
                f"Login failed - Status: {response.status_code if response else 'No response'}")
            return test_results
    except Exception as e:
        test_results.log_test(2, "Super Admin Login", False, f"Login failed: {str(e)}")
        return test_results
    
    # Set auth headers for subsequent requests
    auth_headers = {"Authorization": f"Bearer {test_results.auth_token}"}
    
    # Step 3: Admin Stats
    try:
        response = make_request('GET', '/api/admin/stats', headers=auth_headers)
        if response and response.status_code == 200:
            stats = response.json()
            test_results.log_test(3, "Admin Stats", True, 
                f"Stats retrieved - Societies: {stats.get('totalSocieties', 0)}, Users: {stats.get('totalUsers', 0)}", 
                stats)
        else:
            test_results.log_test(3, "Admin Stats", False, 
                f"Stats failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(3, "Admin Stats", False, f"Stats failed: {str(e)}")
    
    # Step 4: Create Society
    try:
        society_data = {
            "name": "Test Society Alpha",
            "address": "123 Test Street, Mumbai",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "phone": "9876543210",
            "email": "admin@testsocietyalpha.com",
            "registrationNumber": "SOC-TEST-ALPHA-001",
            "societyType": "residential",
            "description": "Test society for comprehensive backend testing",
            "establishedYear": 2020,
            "builderName": "Test Builders Ltd",
            "amenities": ["Swimming Pool", "Gym", "Garden"],
            "billingPeriod": "monthly",
            "maintenanceAmount": 2500.00,
            "status": "active",
            "adminCredentials": {
                "name": "Society Admin Alpha",
                "userId": "admin_alpha_001",
                "password": "alpha123",
                "phone": "9876543211",
                "email": "societyadmin@testsocietyalpha.com"
            }
        }
        response = make_request('POST', '/api/admin/societies', society_data, headers=auth_headers)
        if response and response.status_code in [200, 201]:
            society_response = response.json()
            test_results.society_id = society_response.get('id')
            test_results.society_admin_credentials = society_response.get('adminCredentials', {})
            test_results.log_test(4, "Create Society", True, 
                f"Society created - ID: {test_results.society_id}, Admin: {test_results.society_admin_credentials.get('userId')}", 
                {'societyId': test_results.society_id, 'adminCredentials': test_results.society_admin_credentials})
        else:
            error_text = response.text if response else 'No response'
            test_results.log_test(4, "Create Society", False, 
                f"Society creation failed - Status: {response.status_code if response else 'No response'}, Error: {error_text}")
            return test_results
    except Exception as e:
        test_results.log_test(4, "Create Society", False, f"Society creation failed: {str(e)}")
        return test_results
    
    # Step 5: List Societies
    try:
        response = make_request('GET', '/api/admin/societies', headers=auth_headers)
        if response and response.status_code == 200:
            societies = response.json()
            test_results.log_test(5, "List Societies", True, 
                f"Found {len(societies)} societies", {'count': len(societies)})
        else:
            test_results.log_test(5, "List Societies", False, 
                f"List societies failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(5, "List Societies", False, f"List societies failed: {str(e)}")
    
    # Step 6: Society Detail with profile=full
    if test_results.society_id:
        try:
            params = {"profile": "full"}
            response = make_request('GET', f'/api/admin/societies/{test_results.society_id}', 
                                  headers=auth_headers, params=params)
            if response and response.status_code == 200:
                society_detail = response.json()
                test_results.log_test(6, "Society Detail", True, 
                    f"Society profile retrieved - Name: {society_detail.get('name')}", 
                    {'name': society_detail.get('name'), 'towers': len(society_detail.get('towers', []))})
            else:
                test_results.log_test(6, "Society Detail", False, 
                    f"Society detail failed - Status: {response.status_code if response else 'No response'}")
        except Exception as e:
            test_results.log_test(6, "Society Detail", False, f"Society detail failed: {str(e)}")
    
    # Step 7: Create User
    try:
        user_data = {
            "name": "Test SOCIETY_ADMIN User",
            "userId": "test_society_admin_002",
            "password": "test123",
            "email": "testsocietyadmin@example.com",
            "phone": "9876543222",
            "role": "SOCIETY_ADMIN",
            "permissions": ["dashboard", "residents", "billing", "complaints"],
            "isActive": True
        }
        response = make_request('POST', '/api/admin/users', user_data, headers=auth_headers)
        if response and response.status_code in [200, 201]:
            user_response = response.json()
            test_results.log_test(7, "Create User", True, 
                f"User created - ID: {user_response.get('id')}, Role: {user_response.get('role')}", 
                {'userId': user_response.get('userId'), 'role': user_response.get('role')})
        else:
            test_results.log_test(7, "Create User", False, 
                f"User creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(7, "Create User", False, f"User creation failed: {str(e)}")
    
    # Step 8: List Users
    try:
        response = make_request('GET', '/api/admin/users', headers=auth_headers)
        if response and response.status_code == 200:
            users = response.json()
            test_results.log_test(8, "List Users", True, 
                f"Found {len(users)} users", {'count': len(users)})
        else:
            test_results.log_test(8, "List Users", False, 
                f"List users failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(8, "List Users", False, f"List users failed: {str(e)}")
    
    # Step 9: Create Team
    try:
        team_data = {
            "name": "Security Team Alpha",
            "description": "Security team for comprehensive testing",
            "permissions": ["security", "parking", "visitors"],
            "isActive": True
        }
        response = make_request('POST', '/api/admin/teams', team_data, headers=auth_headers)
        if response and response.status_code in [200, 201]:
            team_response = response.json()
            test_results.log_test(9, "Create Team", True, 
                f"Team created - ID: {team_response.get('id')}, Name: {team_response.get('name')}", 
                {'teamId': team_response.get('id'), 'name': team_response.get('name')})
        else:
            test_results.log_test(9, "Create Team", False, 
                f"Team creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(9, "Create Team", False, f"Team creation failed: {str(e)}")
    
    # Step 10: List Teams
    try:
        response = make_request('GET', '/api/admin/teams', headers=auth_headers)
        if response and response.status_code == 200:
            teams = response.json()
            test_results.log_test(10, "List Teams", True, 
                f"Found {len(teams)} teams", {'count': len(teams)})
        else:
            test_results.log_test(10, "List Teams", False, 
                f"List teams failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(10, "List Teams", False, f"List teams failed: {str(e)}")
    
    # Now login as Society Admin for society-level operations
    if test_results.society_admin_credentials:
        try:
            society_admin_login = {
                "userId": test_results.society_admin_credentials.get('userId'),
                "password": test_results.society_admin_credentials.get('password')
            }
            response = make_request('POST', '/api/auth/login', society_admin_login)
            if response and response.status_code == 200:
                society_login_response = response.json()
                test_results.society_admin_token = society_login_response.get('token')
                user_data = society_login_response.get('user', {})
                test_results.log_test(11, "Society Admin Login", True, 
                    f"Society admin login successful - Role: {user_data.get('role')}", 
                    {'role': user_data.get('role'), 'societyId': user_data.get('societyId')})
            else:
                error_text = response.text if response else 'No response'
                test_results.log_test(11, "Society Admin Login", False, 
                    f"Society admin login failed - Status: {response.status_code if response else 'No response'}, Error: {error_text}")
                return test_results
        except Exception as e:
            test_results.log_test(11, "Society Admin Login", False, f"Society admin login failed: {str(e)}")
            return test_results
    
    # Set society-level headers
    society_headers = {
        "Authorization": f"Bearer {test_results.society_admin_token}",
        "x-society-id": test_results.society_id
    }
    
    # Step 12: Create Tower
    try:
        tower_data = {
            "name": "Block Alpha",
            "totalFloors": 5,
            "flatsPerFloor": 4,
            "description": "Main residential block for testing"
        }
        response = make_request('POST', '/api/towers', tower_data, headers=society_headers)
        if response and response.status_code in [200, 201]:
            tower_response = response.json()
            test_results.log_test(12, "Create Tower", True, 
                f"Tower created - ID: {tower_response.get('id')}, Flats: {tower_response.get('totalFlats', 0)}", 
                {'towerId': tower_response.get('id'), 'totalFlats': tower_response.get('totalFlats')})
        else:
            test_results.log_test(12, "Create Tower", False, 
                f"Tower creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(12, "Create Tower", False, f"Tower creation failed: {str(e)}")
    
    # Step 13: List Towers
    try:
        response = make_request('GET', '/api/towers', headers=society_headers)
        if response and response.status_code == 200:
            towers = response.json()
            test_results.log_test(13, "List Towers", True, 
                f"Found {len(towers)} towers", {'count': len(towers)})
        else:
            test_results.log_test(13, "List Towers", False, 
                f"List towers failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(13, "List Towers", False, f"List towers failed: {str(e)}")
    
    # Step 14: Create Resident
    try:
        resident_data = {
            "name": "John Alpha Doe",
            "phone": "9876543333",
            "email": "john.alpha@example.com",
            "flatNumber": "A-101",
            "type": "owner",
            "moveInDate": "2024-01-15",
            "emergencyContact": "9876543334",
            "aadharNumber": "123456789012",
            "occupation": "Software Engineer",
            "familyMembers": 3
        }
        response = make_request('POST', '/api/residents', resident_data, headers=society_headers)
        if response and response.status_code in [200, 201]:
            resident_response = response.json()
            test_results.log_test(14, "Create Resident", True, 
                f"Resident created - ID: {resident_response.get('id')}, Flat: {resident_response.get('flatNumber')}", 
                {'residentId': resident_response.get('id'), 'flatNumber': resident_response.get('flatNumber')})
        else:
            test_results.log_test(14, "Create Resident", False, 
                f"Resident creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(14, "Create Resident", False, f"Resident creation failed: {str(e)}")
    
    # Step 15: List Residents
    try:
        response = make_request('GET', '/api/residents', headers=society_headers)
        if response and response.status_code == 200:
            residents = response.json()
            test_results.log_test(15, "List Residents", True, 
                f"Found {len(residents)} residents", {'count': len(residents)})
        else:
            test_results.log_test(15, "List Residents", False, 
                f"List residents failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(15, "List Residents", False, f"List residents failed: {str(e)}")
    
    # Step 16: Create Complaint
    try:
        complaint_data = {
            "title": "Water leakage in A-101",
            "description": "There is a water leakage in the bathroom ceiling of flat A-101",
            "category": "maintenance",
            "priority": "high",
            "flatNumber": "A-101",
            "residentName": "John Alpha Doe",
            "phone": "9876543333"
        }
        response = make_request('POST', '/api/complaints', complaint_data, headers=society_headers)
        if response and response.status_code in [200, 201]:
            complaint_response = response.json()
            test_results.log_test(16, "Create Complaint", True, 
                f"Complaint created - ID: {complaint_response.get('id')}, Priority: {complaint_response.get('priority')}", 
                {'complaintId': complaint_response.get('id'), 'priority': complaint_response.get('priority')})
        else:
            test_results.log_test(16, "Create Complaint", False, 
                f"Complaint creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(16, "Create Complaint", False, f"Complaint creation failed: {str(e)}")
    
    # Step 17: Create Notice
    try:
        notice_data = {
            "title": "Water Supply Maintenance",
            "content": "Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance work",
            "category": "maintenance",
            "priority": "high",
            "validFrom": "2024-01-20",
            "validTo": "2024-01-21",
            "targetAudience": "all"
        }
        response = make_request('POST', '/api/notices', notice_data, headers=society_headers)
        if response and response.status_code in [200, 201]:
            notice_response = response.json()
            test_results.log_test(17, "Create Notice", True, 
                f"Notice created - ID: {notice_response.get('id')}, Title: {notice_response.get('title')}", 
                {'noticeId': notice_response.get('id'), 'title': notice_response.get('title')})
        else:
            test_results.log_test(17, "Create Notice", False, 
                f"Notice creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(17, "Create Notice", False, f"Notice creation failed: {str(e)}")
    
    # Step 18: Create Visitor
    try:
        visitor_data = {
            "name": "Mike Visitor Alpha",
            "phone": "9876543444",
            "purpose": "Personal visit",
            "flatNumber": "A-101",
            "vehicleNumber": "MH-01-AB-1234",
            "expectedDuration": "2 hours",
            "hostName": "John Alpha Doe",
            "hostPhone": "9876543333"
        }
        response = make_request('POST', '/api/visitors', visitor_data, headers=society_headers)
        if response and response.status_code in [200, 201]:
            visitor_response = response.json()
            test_results.log_test(18, "Create Visitor", True, 
                f"Visitor created - ID: {visitor_response.get('id')}, Name: {visitor_response.get('name')}", 
                {'visitorId': visitor_response.get('id'), 'name': visitor_response.get('name')})
        else:
            test_results.log_test(18, "Create Visitor", False, 
                f"Visitor creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(18, "Create Visitor", False, f"Visitor creation failed: {str(e)}")
    
    # Step 19: Create Staff
    try:
        staff_data = {
            "name": "Security Guard Alpha",
            "phone": "9876543555",
            "email": "guard.alpha@testsociety.com",
            "role": "security_guard",
            "shift": "night",
            "salary": 15000,
            "joiningDate": "2024-01-01",
            "aadharNumber": "123456789013",
            "address": "123 Guard Quarters, Mumbai"
        }
        response = make_request('POST', '/api/staff', staff_data, headers=society_headers)
        if response and response.status_code in [200, 201]:
            staff_response = response.json()
            test_results.log_test(19, "Create Staff", True, 
                f"Staff created - ID: {staff_response.get('id')}, Role: {staff_response.get('role')}", 
                {'staffId': staff_response.get('id'), 'role': staff_response.get('role')})
        else:
            test_results.log_test(19, "Create Staff", False, 
                f"Staff creation failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(19, "Create Staff", False, f"Staff creation failed: {str(e)}")
    
    # Step 20: Dashboard Stats
    try:
        response = make_request('GET', '/api/dashboard/stats', headers=society_headers)
        if response and response.status_code == 200:
            dashboard_stats = response.json()
            test_results.log_test(20, "Dashboard Stats", True, 
                f"Dashboard stats retrieved - Residents: {dashboard_stats.get('totalResidents', 0)}, Complaints: {dashboard_stats.get('totalComplaints', 0)}", 
                dashboard_stats)
        else:
            test_results.log_test(20, "Dashboard Stats", False, 
                f"Dashboard stats failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(20, "Dashboard Stats", False, f"Dashboard stats failed: {str(e)}")
    
    # Step 21: User Profile
    try:
        response = make_request('GET', '/api/user/profile', headers=society_headers)
        if response and response.status_code == 200:
            profile = response.json()
            test_results.log_test(21, "User Profile", True, 
                f"User profile retrieved - Name: {profile.get('name')}, Role: {profile.get('role')}", 
                {'name': profile.get('name'), 'role': profile.get('role')})
        else:
            test_results.log_test(21, "User Profile", False, 
                f"User profile failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(21, "User Profile", False, f"User profile failed: {str(e)}")
    
    # Step 22: User Dashboard
    try:
        response = make_request('GET', '/api/user/my-dashboard', headers=society_headers)
        if response and response.status_code == 200:
            dashboard = response.json()
            test_results.log_test(22, "User Dashboard", True, 
                f"User dashboard retrieved successfully", dashboard)
        else:
            test_results.log_test(22, "User Dashboard", False, 
                f"User dashboard failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(22, "User Dashboard", False, f"User dashboard failed: {str(e)}")
    
    # Step 23: Trigger SOS
    try:
        sos_data = {
            "type": "emergency",
            "location": "A-101",
            "description": "Medical emergency - need immediate assistance",
            "severity": "high"
        }
        response = make_request('POST', '/api/user/sos', sos_data, headers=society_headers)
        if response and response.status_code in [200, 201]:
            sos_response = response.json()
            test_results.log_test(23, "Trigger SOS", True, 
                f"SOS triggered - ID: {sos_response.get('id')}, Type: {sos_response.get('type')}", 
                {'sosId': sos_response.get('id'), 'type': sos_response.get('type')})
        else:
            test_results.log_test(23, "Trigger SOS", False, 
                f"SOS trigger failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(23, "Trigger SOS", False, f"SOS trigger failed: {str(e)}")
    
    # Step 24: Active SOS
    try:
        response = make_request('GET', '/api/user/sos/active', headers=society_headers)
        if response and response.status_code == 200:
            active_sos = response.json()
            test_results.log_test(24, "Active SOS", True, 
                f"Active SOS retrieved - Count: {len(active_sos) if isinstance(active_sos, list) else 'N/A'}", 
                active_sos)
        else:
            test_results.log_test(24, "Active SOS", False, 
                f"Active SOS failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(24, "Active SOS", False, f"Active SOS failed: {str(e)}")
    
    # Step 25: My Complaints (Note: should be GET not POST as per typical REST patterns)
    try:
        response = make_request('GET', '/api/user/my-complaints', headers=society_headers)
        if response and response.status_code == 200:
            my_complaints = response.json()
            test_results.log_test(25, "My Complaints", True, 
                f"My complaints retrieved - Count: {len(my_complaints) if isinstance(my_complaints, list) else 'N/A'}", 
                my_complaints)
        else:
            # Try POST method as specified in review request
            response = make_request('POST', '/api/user/my-complaints', headers=society_headers)
            if response and response.status_code == 200:
                my_complaints = response.json()
                test_results.log_test(25, "My Complaints", True, 
                    f"My complaints retrieved via POST - Count: {len(my_complaints) if isinstance(my_complaints, list) else 'N/A'}", 
                    my_complaints)
            else:
                test_results.log_test(25, "My Complaints", False, 
                    f"My complaints failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(25, "My Complaints", False, f"My complaints failed: {str(e)}")
    
    # Step 26: My Visitors
    try:
        response = make_request('GET', '/api/user/my-visitors', headers=society_headers)
        if response and response.status_code == 200:
            my_visitors = response.json()
            test_results.log_test(26, "My Visitors", True, 
                f"My visitors retrieved - Count: {len(my_visitors) if isinstance(my_visitors, list) else 'N/A'}", 
                my_visitors)
        else:
            test_results.log_test(26, "My Visitors", False, 
                f"My visitors failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(26, "My Visitors", False, f"My visitors failed: {str(e)}")
    
    # Step 27: My Notices
    try:
        response = make_request('GET', '/api/user/my-notices', headers=society_headers)
        if response and response.status_code == 200:
            my_notices = response.json()
            test_results.log_test(27, "My Notices", True, 
                f"My notices retrieved - Count: {len(my_notices) if isinstance(my_notices, list) else 'N/A'}", 
                my_notices)
        else:
            test_results.log_test(27, "My Notices", False, 
                f"My notices failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(27, "My Notices", False, f"My notices failed: {str(e)}")
    
    # Step 28: My Bills
    try:
        response = make_request('GET', '/api/user/my-bills', headers=society_headers)
        if response and response.status_code == 200:
            my_bills = response.json()
            test_results.log_test(28, "My Bills", True, 
                f"My bills retrieved - Count: {len(my_bills) if isinstance(my_bills, list) else 'N/A'}", 
                my_bills)
        else:
            test_results.log_test(28, "My Bills", False, 
                f"My bills failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(28, "My Bills", False, f"My bills failed: {str(e)}")
    
    # Step 29: My Bookings
    try:
        response = make_request('GET', '/api/user/my-bookings', headers=society_headers)
        if response and response.status_code == 200:
            my_bookings = response.json()
            test_results.log_test(29, "My Bookings", True, 
                f"My bookings retrieved - Count: {len(my_bookings) if isinstance(my_bookings, list) else 'N/A'}", 
                my_bookings)
        else:
            test_results.log_test(29, "My Bookings", False, 
                f"My bookings failed - Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        test_results.log_test(29, "My Bookings", False, f"My bookings failed: {str(e)}")
    
    return test_results

if __name__ == "__main__":
    print(f"Society Management System Backend Test")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend URL: {BASE_URL}")
    print()
    
    results = test_society_management_system()
    results.print_summary()
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Exit with appropriate code
    if results.failed_tests > 0:
        sys.exit(1)
    else:
        sys.exit(0)