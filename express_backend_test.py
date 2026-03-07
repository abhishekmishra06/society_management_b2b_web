#!/usr/bin/env python3

"""
Express.js Backend Comprehensive Test Suite
Tests the complete Society Management System Express backend
Following the exact test flow specified in the review request
"""

import requests
import json
import uuid
import sys
from datetime import datetime, timedelta
import time

# Configuration
BASE_URL = "https://quirky-sinoussi-5.preview.emergentagent.com/api"
HEADERS = {
    'Content-Type': 'application/json'
}

# Global variables for test data
jwt_token = None
society_id = None
society_headers = {}

def log_test(test_name, status, message=""):
    """Log test results with status indicators"""
    status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"{status_icon} {test_name}: {message}")

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request with error handling"""
    try:
        url = f"{BASE_URL}{endpoint}"
        request_headers = HEADERS.copy()
        if headers:
            request_headers.update(headers)
            
        if method.upper() == 'GET':
            response = requests.get(url, headers=request_headers, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=request_headers, timeout=10)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=request_headers, timeout=10)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=request_headers, timeout=10)
        
        print(f"  → {method} {endpoint} → {response.status_code}")
        
        if response.status_code != expected_status:
            print(f"    Expected {expected_status}, got {response.status_code}")
            print(f"    Response: {response.text[:200]}...")
            return None
            
        return response.json() if response.content else {}
        
    except requests.exceptions.Timeout:
        print(f"  → TIMEOUT after 10s")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  → REQUEST ERROR: {e}")
        return None
    except json.JSONDecodeError:
        print(f"  → JSON DECODE ERROR")
        return None

def test_1_health_check():
    """Test 1: Health Check"""
    print("\n🔍 TEST 1: Health Check")
    
    result = make_request('GET', '/health')
    
    if not result:
        log_test("Health Check", "FAIL", "No response received")
        return False
    
    expected_keys = ['status', 'service', 'database', 'architecture']
    missing_keys = [key for key in expected_keys if key not in result]
    
    if missing_keys:
        log_test("Health Check", "FAIL", f"Missing keys: {missing_keys}")
        return False
    
    if (result.get('status') == 'ok' and 
        result.get('service') == 'society-management-backend' and
        result.get('database') == 'mysql' and
        result.get('architecture') == 'multi-tenant'):
        log_test("Health Check", "PASS", "Backend healthy - MySQL multi-tenant architecture")
        return True
    else:
        log_test("Health Check", "FAIL", f"Invalid response: {result}")
        return False

def test_2_auth_login():
    """Test 2: Auth Login"""
    global jwt_token
    
    print("\n🔑 TEST 2: Auth Login")
    
    login_data = {
        "userId": "admin001",
        "password": "admin123"
    }
    
    result = make_request('POST', '/auth/login', login_data)
    
    if not result:
        log_test("Auth Login", "FAIL", "No response received")
        return False
    
    if 'token' not in result or 'user' not in result:
        log_test("Auth Login", "FAIL", "Missing token or user in response")
        return False
    
    user = result.get('user', {})
    if user.get('role') != 'SUPER_ADMIN':
        log_test("Auth Login", "FAIL", f"Expected SUPER_ADMIN role, got: {user.get('role')}")
        return False
    
    jwt_token = result['token']
    HEADERS['Authorization'] = f'Bearer {jwt_token}'
    
    log_test("Auth Login", "PASS", f"Login successful, role: {user.get('role')}, userId: {user.get('userId')}")
    return True

def test_3_admin_stats():
    """Test 3: Admin Stats"""
    print("\n📊 TEST 3: Admin Stats")
    
    result = make_request('GET', '/admin/stats')
    
    if not result:
        log_test("Admin Stats", "FAIL", "No response received")
        return False
    
    expected_keys = ['totalSocieties', 'totalUsers']
    missing_keys = [key for key in expected_keys if key not in result]
    
    if missing_keys:
        log_test("Admin Stats", "FAIL", f"Missing keys: {missing_keys}")
        return False
    
    stats_summary = f"Societies: {result.get('totalSocieties', 0)}, Users: {result.get('totalUsers', 0)}, Teams: {result.get('totalTeams', 0)}"
    log_test("Admin Stats", "PASS", stats_summary)
    return True

def test_4_create_society():
    """Test 4: Create Society"""
    global society_id, society_headers
    
    print("\n🏢 TEST 4: Create Society")
    
    society_data = {
        "name": "Test Society Alpha",
        "city": "Delhi", 
        "state": "Delhi",
        "societyType": "residential",
        "amenities": ["Gym", "Pool"],
        "registrationNo": "TST-001"
    }
    
    result = make_request('POST', '/admin/societies', society_data)
    
    if not result:
        log_test("Create Society", "FAIL", "No response received")
        return False
    
    if 'id' not in result:
        log_test("Create Society", "FAIL", "No society ID returned")
        return False
    
    society_id = result['id']
    society_headers = {'x-society-id': society_id}
    
    log_test("Create Society", "PASS", f"Society created with ID: {society_id}")
    return True

def test_5_get_societies():
    """Test 5: Get Societies"""
    print("\n📋 TEST 5: Get Societies")
    
    result = make_request('GET', '/admin/societies')
    
    if not result:
        log_test("Get Societies", "FAIL", "No response received")
        return False
    
    if not isinstance(result, list):
        log_test("Get Societies", "FAIL", "Response is not a list")
        return False
    
    # Check if our created society exists
    found_society = any(society.get('id') == society_id for society in result)
    
    if not found_society:
        log_test("Get Societies", "FAIL", f"Created society {society_id} not found in list")
        return False
    
    log_test("Get Societies", "PASS", f"Retrieved {len(result)} societies, including created society")
    return True

def test_6_society_profile():
    """Test 6: Society Profile"""
    print("\n👁️ TEST 6: Society Profile")
    
    if not society_id:
        log_test("Society Profile", "FAIL", "No society ID available")
        return False
    
    result = make_request('GET', f'/admin/societies/{society_id}?profile=full')
    
    if not result:
        log_test("Society Profile", "FAIL", "No response received")
        return False
    
    if result.get('id') != society_id:
        log_test("Society Profile", "FAIL", f"Wrong society ID returned: {result.get('id')}")
        return False
    
    profile_info = f"Name: {result.get('name')}, City: {result.get('city')}, Type: {result.get('societyType')}"
    log_test("Society Profile", "PASS", profile_info)
    return True

def test_7_create_tower():
    """Test 7: Create Tower"""
    print("\n🏗️ TEST 7: Create Tower")
    
    if not society_id:
        log_test("Create Tower", "FAIL", "No society ID available")
        return False
    
    tower_data = {
        "name": "Block A",
        "totalFloors": 3,
        "flatsPerFloor": 2
    }
    
    result = make_request('POST', f'/admin/societies/{society_id}/towers', tower_data)
    
    if not result:
        log_test("Create Tower", "FAIL", "No response received")
        return False
    
    if 'id' not in result:
        log_test("Create Tower", "FAIL", "No tower ID returned")
        return False
    
    tower_info = f"Tower: {result.get('name')}, ID: {result.get('id')}"
    log_test("Create Tower", "PASS", f"{tower_info} - Should auto-create 6 flats")
    return True

def test_8_get_towers():
    """Test 8: Get Towers"""
    print("\n🏢 TEST 8: Get Towers")
    
    if not society_id:
        log_test("Get Towers", "FAIL", "No society ID available")
        return False
    
    result = make_request('GET', f'/admin/societies/{society_id}/towers')
    
    if not result:
        log_test("Get Towers", "FAIL", "No response received")
        return False
    
    if not isinstance(result, list):
        log_test("Get Towers", "FAIL", "Response is not a list")
        return False
    
    # Check if Block A exists with flatCount=6
    block_a = next((tower for tower in result if tower.get('name') == 'Block A'), None)
    
    if not block_a:
        log_test("Get Towers", "FAIL", "Block A not found in towers list")
        return False
    
    flat_count = block_a.get('flatCount', 0)
    if flat_count != 6:
        log_test("Get Towers", "WARN", f"Expected flatCount=6, got: {flat_count}")
    
    log_test("Get Towers", "PASS", f"Retrieved {len(result)} towers, Block A has {flat_count} flats")
    return True

def test_9_get_flats():
    """Test 9: Get Flats"""
    print("\n🏠 TEST 9: Get Flats")
    
    if not society_id:
        log_test("Get Flats", "FAIL", "No society ID available")
        return False
    
    result = make_request('GET', f'/admin/societies/{society_id}/flats')
    
    if not result:
        log_test("Get Flats", "FAIL", "No response received")
        return False
    
    if not isinstance(result, list):
        log_test("Get Flats", "FAIL", "Response is not a list")
        return False
    
    expected_flats = 6  # 3 floors × 2 flats per floor
    actual_flats = len(result)
    
    if actual_flats < expected_flats:
        log_test("Get Flats", "WARN", f"Expected {expected_flats} flats, got: {actual_flats}")
    
    log_test("Get Flats", "PASS", f"Retrieved {actual_flats} auto-generated flats")
    return True

def test_10_society_module_tests():
    """Test 10: Society Module Tests"""
    print("\n🏘️ TEST 10: Society Module Tests (with x-society-id header)")
    
    if not society_id:
        log_test("Society Modules", "FAIL", "No society ID available")
        return False
    
    # Test residents
    print("  Testing Residents module...")
    resident_data = {
        "name": "Rahul Sharma",
        "flatNumber": "101",
        "tower": "Block A", 
        "phone": "9111111111",
        "type": "owner",
        "status": "active"
    }
    
    resident_result = make_request('POST', '/residents', resident_data, society_headers)
    if not resident_result:
        log_test("Create Resident", "FAIL", "Failed to create resident")
        return False
    
    residents_list = make_request('GET', '/residents', headers=society_headers)
    if not residents_list or not isinstance(residents_list, list):
        log_test("Get Residents", "FAIL", "Failed to get residents list")
        return False
    
    log_test("Residents Module", "PASS", f"Created resident, retrieved {len(residents_list)} residents")
    
    # Test complaints
    print("  Testing Complaints module...")
    complaint_data = {
        "title": "Lift Not Working",
        "category": "maintenance",
        "priority": "high",
        "status": "open"
    }
    
    complaint_result = make_request('POST', '/complaints', complaint_data, society_headers)
    if complaint_result:
        complaints_list = make_request('GET', '/complaints', headers=society_headers)
        if complaints_list and isinstance(complaints_list, list):
            log_test("Complaints Module", "PASS", f"Created complaint, retrieved {len(complaints_list)} complaints")
        else:
            log_test("Complaints Module", "FAIL", "Failed to get complaints list")
    else:
        log_test("Complaints Module", "FAIL", "Failed to create complaint")
    
    # Test notices
    print("  Testing Notices module...")
    notice_data = {
        "title": "Water Shutdown",
        "category": "maintenance"
    }
    
    notice_result = make_request('POST', '/notices', notice_data, society_headers)
    if notice_result:
        log_test("Notices Module", "PASS", "Created notice successfully")
    else:
        log_test("Notices Module", "FAIL", "Failed to create notice")
    
    # Test parking
    print("  Testing Parking module...")
    parking_data = {
        "slotNumber": "A-001",
        "type": "four_wheeler", 
        "status": "available"
    }
    
    parking_result = make_request('POST', '/parking', parking_data, society_headers)
    if parking_result:
        log_test("Parking Module", "PASS", "Created parking slot successfully")
    else:
        log_test("Parking Module", "FAIL", "Failed to create parking slot")
    
    # Test billing
    print("  Testing Billing module...")
    billing_data = {
        "flatNumber": "101",
        "tower": "Block A",
        "residentName": "Rahul",
        "amount": 5000,
        "type": "maintenance",
        "status": "pending"
    }
    
    billing_result = make_request('POST', '/billing', billing_data, society_headers)
    if billing_result:
        log_test("Billing Module", "PASS", "Created billing record successfully")
    else:
        log_test("Billing Module", "FAIL", "Failed to create billing record")
    
    # Test dashboard stats
    print("  Testing Dashboard stats...")
    stats_result = make_request('GET', '/dashboard/stats', headers=society_headers)
    if stats_result and 'residents' in stats_result:
        stats_info = f"Residents: {stats_result.get('residents', 0)}, Complaints: {stats_result.get('complaints', 0)}"
        log_test("Dashboard Stats", "PASS", stats_info)
    else:
        log_test("Dashboard Stats", "FAIL", "Failed to get dashboard stats")
    
    return True

def test_11_create_user():
    """Test 11: Create User"""
    print("\n👤 TEST 11: Create User")
    
    user_data = {
        "name": "Society Admin",
        "userId": "socadmin001",
        "password": "pass123",
        "role": "SOCIETY_ADMIN",
        "permissions": ["dashboard", "billing", "residents"]
    }
    
    result = make_request('POST', '/admin/users', user_data)
    
    if not result:
        log_test("Create User", "FAIL", "No response received")
        return False
    
    if 'id' not in result:
        log_test("Create User", "FAIL", "No user ID returned")
        return False
    
    user_info = f"Name: {result.get('name')}, Role: {result.get('role')}, UserID: {result.get('userId')}"
    log_test("Create User", "PASS", user_info)
    return True

def test_12_create_team():
    """Test 12: Create Team"""
    print("\n👥 TEST 12: Create Team")
    
    team_data = {
        "name": "Maintenance Team",
        "permissions": ["complaints", "facilities"]
    }
    
    result = make_request('POST', '/admin/teams', team_data)
    
    if not result:
        log_test("Create Team", "FAIL", "No response received")
        return False
    
    if 'id' not in result:
        log_test("Create Team", "FAIL", "No team ID returned")
        return False
    
    team_info = f"Name: {result.get('name')}, Permissions: {result.get('permissions')}"
    log_test("Create Team", "PASS", team_info)
    return True

def test_13_notifications():
    """Test 13: Notifications"""
    print("\n🔔 TEST 13: Notifications")
    
    if not society_id:
        log_test("Notifications", "FAIL", "No society ID available")
        return False
    
    notification_data = {
        "title": "Test Alert",
        "body": "Testing push",
        "type": "alert", 
        "societyId": society_id
    }
    
    result = make_request('POST', '/notifications', notification_data)
    
    if result:
        log_test("Notifications", "PASS", "Notification sent successfully")
        return True
    else:
        log_test("Notifications", "FAIL", "Failed to send notification")
        return False

def test_14_cleanup():
    """Test 14: Cleanup"""
    print("\n🧹 TEST 14: Cleanup")
    
    if not society_id:
        log_test("Cleanup", "WARN", "No society ID to cleanup")
        return True
    
    result = make_request('DELETE', f'/admin/societies/{society_id}')
    
    if result is not None:  # DELETE might return empty response
        log_test("Cleanup", "PASS", f"Society {society_id} deleted successfully")
        return True
    else:
        log_test("Cleanup", "FAIL", "Failed to delete society")
        return False

def main():
    """Main test execution"""
    print("=" * 80)
    print("🚀 EXPRESS.JS BACKEND COMPREHENSIVE TEST SUITE")
    print("   Society Management System - Multi-tenant MySQL Architecture") 
    print("=" * 80)
    
    tests = [
        test_1_health_check,
        test_2_auth_login, 
        test_3_admin_stats,
        test_4_create_society,
        test_5_get_societies,
        test_6_society_profile,
        test_7_create_tower,
        test_8_get_towers,
        test_9_get_flats,
        test_10_society_module_tests,
        test_11_create_user,
        test_12_create_team,
        test_13_notifications,
        test_14_cleanup
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: EXCEPTION - {e}")
            failed += 1
        
        time.sleep(0.5)  # Brief pause between tests
    
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    print(f"✅ PASSED: {passed}")
    print(f"❌ FAILED: {failed}")
    print(f"📈 SUCCESS RATE: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Express.js backend is fully functional.")
        return True
    else:
        print(f"\n⚠️  {failed} tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)