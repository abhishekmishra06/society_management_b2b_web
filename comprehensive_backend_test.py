#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Society Management System
Tests the COMPLETE backend API that was rewritten from MongoDB to MySQL with multi-tenant architecture.

Each society gets its own MySQL database (society_{uuid}) with all society-specific tables.
Society-level API endpoints require the `x-society-id` header with the society's UUID.
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://quirky-sinoussi-5.preview.emergentagent.com/api"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

class ComprehensiveBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.auth_token = None
        self.society_id = None
        self.tower_id = None
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test result with details"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if response_data and isinstance(response_data, dict):
            print(f"   Response: {json.dumps(response_data, indent=2, default=str)[:300]}...")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success, 
            "message": message,
            "response": response_data
        })

    def test_auth_login(self) -> bool:
        """Test POST /api/auth/login with admin001/admin123"""
        try:
            url = f"{BASE_URL}/auth/login"
            payload = {"userId": "admin001", "password": "admin123"}
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data and data["user"].get("role") == "SUPER_ADMIN":
                    self.auth_token = data["token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_result(
                        "Auth Login",
                        True,
                        f"Login successful, got token and SUPER_ADMIN user. User: {data['user']['name']}, Role: {data['user']['role']}",
                        data
                    )
                    return True
                else:
                    self.log_result("Auth Login", False, f"Invalid response structure or role: {data}")
                    return False
            else:
                self.log_result("Auth Login", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Auth Login", False, f"Exception: {str(e)}")
            return False

    def test_admin_stats(self) -> bool:
        """Test GET /api/admin/stats"""
        try:
            url = f"{BASE_URL}/admin/stats"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["totalSocieties", "totalUsers", "totalTeams"]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result(
                        "Admin Stats",
                        True,
                        f"Admin stats retrieved: totalSocieties={data.get('totalSocieties')}, totalUsers={data.get('totalUsers')}, totalTeams={data.get('totalTeams')}",
                        data
                    )
                    return True
                else:
                    self.log_result("Admin Stats", False, f"Missing required fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("Admin Stats", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Stats", False, f"Exception: {str(e)}")
            return False

    def test_create_society(self) -> bool:
        """Test POST /api/admin/societies - creates society + individual MySQL DB"""
        try:
            url = f"{BASE_URL}/admin/societies"
            payload = {
                "name": "Test Society",
                "city": "Mumbai", 
                "state": "Maharashtra",
                "societyType": "residential",
                "amenities": ["Swimming Pool", "Gym"],
                "billingPeriod": "monthly"
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data:
                    self.society_id = data["id"]
                    self.log_result(
                        "Create Society",
                        True,
                        f"Society created successfully with ID: {self.society_id}. Name: {data['name']}, City: {data.get('city')}",
                        data
                    )
                    return True
                else:
                    self.log_result("Create Society", False, f"Missing ID in response: {data}")
                    return False
            else:
                self.log_result("Create Society", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Society", False, f"Exception: {str(e)}")
            return False

    def test_get_societies_list(self) -> bool:
        """Test GET /api/admin/societies"""
        try:
            url = f"{BASE_URL}/admin/societies"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Look for our created society
                    created_society = next((s for s in data if s.get('id') == self.society_id), None)
                    
                    if created_society:
                        self.log_result(
                            "Get Societies List",
                            True,
                            f"Societies list retrieved with {len(data)} societies, including newly created society: {created_society['name']}",
                            {"total_societies": len(data), "created_society": created_society}
                        )
                        return True
                    else:
                        self.log_result(
                            "Get Societies List", 
                            False, 
                            f"Created society {self.society_id} not found in list",
                            data
                        )
                        return False
                else:
                    self.log_result("Get Societies List", False, f"Expected array, got: {type(data)}", data)
                    return False
            else:
                self.log_result("Get Societies List", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Societies List", False, f"Exception: {str(e)}")
            return False

    def test_get_society_profile(self) -> bool:
        """Test GET /api/admin/societies/{societyId}?profile=full"""
        try:
            if not self.society_id:
                self.log_result("Get Society Profile", False, "No society ID available")
                return False
                
            url = f"{BASE_URL}/admin/societies/{self.society_id}?profile=full"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "name", "towers", "flats", "residents", "stats"]
                
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields:
                    self.log_result(
                        "Get Society Profile",
                        True,
                        f"Society profile retrieved with towers, flats, residents, and stats. Society: {data['name']}",
                        data
                    )
                    return True
                else:
                    self.log_result("Get Society Profile", False, f"Missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("Get Society Profile", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Society Profile", False, f"Exception: {str(e)}")
            return False

    def test_create_tower(self) -> bool:
        """Test POST /api/admin/societies/{societyId}/towers - auto-generates flats"""
        try:
            if not self.society_id:
                self.log_result("Create Tower", False, "No society ID available")
                return False
                
            url = f"{BASE_URL}/admin/societies/{self.society_id}/towers"
            payload = {
                "name": "Tower A",
                "totalFloors": 3,
                "flatsPerFloor": 2
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data:
                    self.tower_id = data["id"]
                    self.log_result(
                        "Create Tower",
                        True,
                        f"Tower created successfully with ID: {self.tower_id}. Name: {data['name']}, should auto-generate 6 flats (3 floors × 2 flats)",
                        data
                    )
                    return True
                else:
                    self.log_result("Create Tower", False, f"Missing ID in response: {data}")
                    return False
            else:
                self.log_result("Create Tower", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Tower", False, f"Exception: {str(e)}")
            return False

    def test_get_towers(self) -> bool:
        """Test GET /api/admin/societies/{societyId}/towers"""
        try:
            if not self.society_id:
                self.log_result("Get Towers", False, "No society ID available")
                return False
                
            url = f"{BASE_URL}/admin/societies/{self.society_id}/towers"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    created_tower = next((t for t in data if t.get('id') == self.tower_id), None)
                    
                    if created_tower:
                        self.log_result(
                            "Get Towers",
                            True,
                            f"Towers list retrieved with {len(data)} towers, including created tower: {created_tower['name']} with flatCount: {created_tower.get('flatCount', 'N/A')}",
                            {"total_towers": len(data), "created_tower": created_tower}
                        )
                        return True
                    else:
                        self.log_result("Get Towers", False, f"Created tower {self.tower_id} not found", data)
                        return False
                else:
                    self.log_result("Get Towers", False, f"Expected array, got: {type(data)}", data)
                    return False
            else:
                self.log_result("Get Towers", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Towers", False, f"Exception: {str(e)}")
            return False

    def test_get_flats(self) -> bool:
        """Test GET /api/admin/societies/{societyId}/flats - should return 6 auto-generated flats"""
        try:
            if not self.society_id:
                self.log_result("Get Flats", False, "No society ID available")
                return False
                
            url = f"{BASE_URL}/admin/societies/{self.society_id}/flats"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(
                        "Get Flats",
                        True,
                        f"Flats list retrieved with {len(data)} flats (expected 6 auto-generated flats from 3 floors × 2 flats)",
                        {"total_flats": len(data), "flats": data[:3] if len(data) > 3 else data}  # Show first 3 flats
                    )
                    return True
                else:
                    self.log_result("Get Flats", False, f"Expected array, got: {type(data)}", data)
                    return False
            else:
                self.log_result("Get Flats", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Flats", False, f"Exception: {str(e)}")
            return False

    def test_create_flat_manually(self) -> bool:
        """Test POST /api/admin/societies/{societyId}/flats - create flat manually"""
        try:
            if not self.society_id or not self.tower_id:
                self.log_result("Create Flat Manually", False, "No society ID or tower ID available")
                return False
                
            url = f"{BASE_URL}/admin/societies/{self.society_id}/flats"
            payload = {
                "towerId": self.tower_id,
                "towerName": "Tower A",
                "flatNumber": "PH1",
                "type": "Penthouse",
                "status": "vacant"
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "flatNumber" in data:
                    self.log_result(
                        "Create Flat Manually",
                        True,
                        f"Flat created successfully with ID: {data['id']}. Flat Number: {data['flatNumber']}, Type: {data.get('type')}",
                        data
                    )
                    return True
                else:
                    self.log_result("Create Flat Manually", False, f"Missing ID or flatNumber in response: {data}")
                    return False
            else:
                self.log_result("Create Flat Manually", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Flat Manually", False, f"Exception: {str(e)}")
            return False

    def test_society_level_endpoints(self) -> bool:
        """Test society-level endpoints that require x-society-id header"""
        if not self.society_id:
            self.log_result("Society Level Endpoints", False, "No society ID available")
            return False

        # Add society ID header
        self.session.headers.update({"x-society-id": self.society_id})
        
        endpoints_tested = []
        all_success = True

        # Test 1: Create Resident
        try:
            url = f"{BASE_URL}/residents"
            payload = {
                "name": "John",
                "flatNumber": "101",
                "tower": "Tower A",
                "phone": "9999999999",
                "type": "owner",
                "status": "active"
            }
            response = self.session.post(url, json=payload)
            success = response.status_code == 200
            endpoints_tested.append(f"POST /residents: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"POST /residents: ❌ Exception: {str(e)}")
            all_success = False

        # Test 2: Get Residents
        try:
            url = f"{BASE_URL}/residents"
            response = self.session.get(url)
            success = response.status_code == 200
            endpoints_tested.append(f"GET /residents: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"GET /residents: ❌ Exception: {str(e)}")
            all_success = False

        # Test 3: Create Complaint
        try:
            url = f"{BASE_URL}/complaints"
            payload = {
                "title": "Water Leak",
                "description": "Water leaking from ceiling",
                "category": "plumbing",
                "priority": "high"
            }
            response = self.session.post(url, json=payload)
            success = response.status_code == 200
            endpoints_tested.append(f"POST /complaints: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"POST /complaints: ❌ Exception: {str(e)}")
            all_success = False

        # Test 4: Get Complaints
        try:
            url = f"{BASE_URL}/complaints"
            response = self.session.get(url)
            success = response.status_code == 200
            endpoints_tested.append(f"GET /complaints: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"GET /complaints: ❌ Exception: {str(e)}")
            all_success = False

        # Test 5: Create Notice
        try:
            url = f"{BASE_URL}/notices"
            payload = {
                "title": "Monthly Meeting",
                "description": "Meeting on Saturday",
                "category": "general"
            }
            response = self.session.post(url, json=payload)
            success = response.status_code == 200
            endpoints_tested.append(f"POST /notices: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"POST /notices: ❌ Exception: {str(e)}")
            all_success = False

        # Test 6: Get Notices
        try:
            url = f"{BASE_URL}/notices"
            response = self.session.get(url)
            success = response.status_code == 200
            endpoints_tested.append(f"GET /notices: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"GET /notices: ❌ Exception: {str(e)}")
            all_success = False

        # Test 7: Create Parking
        try:
            url = f"{BASE_URL}/parking"
            payload = {
                "slotNumber": "P-001",
                "type": "four_wheeler",
                "status": "available"
            }
            response = self.session.post(url, json=payload)
            success = response.status_code == 200
            endpoints_tested.append(f"POST /parking: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"POST /parking: ❌ Exception: {str(e)}")
            all_success = False

        # Test 8: Get Parking
        try:
            url = f"{BASE_URL}/parking"
            response = self.session.get(url)
            success = response.status_code == 200
            endpoints_tested.append(f"GET /parking: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"GET /parking: ❌ Exception: {str(e)}")
            all_success = False

        # Test 9: Create Billing
        try:
            url = f"{BASE_URL}/billing"
            payload = {
                "flatNumber": "101",
                "tower": "Tower A", 
                "residentName": "John",
                "amount": 5000,
                "type": "maintenance",
                "status": "pending"
            }
            response = self.session.post(url, json=payload)
            success = response.status_code == 200
            endpoints_tested.append(f"POST /billing: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"POST /billing: ❌ Exception: {str(e)}")
            all_success = False

        # Test 10: Get Billing
        try:
            url = f"{BASE_URL}/billing"
            response = self.session.get(url)
            success = response.status_code == 200
            endpoints_tested.append(f"GET /billing: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"GET /billing: ❌ Exception: {str(e)}")
            all_success = False

        # Test 11: Get Dashboard Stats
        try:
            url = f"{BASE_URL}/dashboard/stats"
            response = self.session.get(url)
            success = response.status_code == 200
            endpoints_tested.append(f"GET /dashboard/stats: {'✅' if success else '❌'} ({response.status_code})")
            if not success:
                all_success = False
        except Exception as e:
            endpoints_tested.append(f"GET /dashboard/stats: ❌ Exception: {str(e)}")
            all_success = False

        # Remove society header
        if "x-society-id" in self.session.headers:
            del self.session.headers["x-society-id"]

        self.log_result(
            "Society Level Endpoints (with x-society-id header)",
            all_success,
            f"Tested {len(endpoints_tested)} society-level endpoints:\n   " + "\n   ".join(endpoints_tested),
            {"society_id": self.society_id, "endpoints_tested": endpoints_tested}
        )
        
        return all_success

    def test_notifications(self) -> bool:
        """Test POST /api/notifications"""
        try:
            if not self.society_id:
                self.log_result("Notifications", False, "No society ID available")
                return False
                
            url = f"{BASE_URL}/notifications"
            payload = {
                "title": "Test Notification",
                "body": "This is a test",
                "type": "general",
                "societyId": self.society_id
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Notifications",
                    True,
                    f"Notification created successfully: {data.get('message')}",
                    data
                )
                return True
            else:
                self.log_result("Notifications", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Notifications", False, f"Exception: {str(e)}")
            return False

    def test_create_user(self) -> bool:
        """Test POST /api/admin/users"""
        try:
            url = f"{BASE_URL}/admin/users"
            payload = {
                "name": "Test Admin",
                "userId": "testadmin001",
                "password": "pass123",
                "role": "SOCIETY_ADMIN",
                "email": "test@test.com",
                "permissions": ["dashboard", "billing", "residents"]
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "userId" in data:
                    self.log_result(
                        "Create User",
                        True,
                        f"User created successfully with ID: {data['id']}. Name: {data['name']}, Role: {data.get('role')}",
                        data
                    )
                    return True
                else:
                    self.log_result("Create User", False, f"Missing ID or userId in response: {data}")
                    return False
            else:
                self.log_result("Create User", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create User", False, f"Exception: {str(e)}")
            return False

    def test_create_team(self) -> bool:
        """Test POST /api/admin/teams"""
        try:
            url = f"{BASE_URL}/admin/teams"
            payload = {
                "name": "Security Team",
                "description": "Handles security",
                "permissions": ["security", "visitors", "gate_passes"]
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data:
                    self.log_result(
                        "Create Team",
                        True,
                        f"Team created successfully with ID: {data['id']}. Name: {data['name']}, Permissions: {data.get('permissions')}",
                        data
                    )
                    return True
                else:
                    self.log_result("Create Team", False, f"Missing ID or name in response: {data}")
                    return False
            else:
                self.log_result("Create Team", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Team", False, f"Exception: {str(e)}")
            return False

    def test_cleanup_society(self) -> bool:
        """Test DELETE /api/admin/societies/{societyId} - also drops the individual DB"""
        try:
            if not self.society_id:
                self.log_result("Cleanup Society", False, "No society ID available")
                return False
                
            url = f"{BASE_URL}/admin/societies/{self.society_id}"
            print(f"Testing: DELETE {url}")
            
            response = self.session.delete(url)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Cleanup Society",
                    True,
                    f"Society deleted successfully: {data.get('message')}. Should also drop individual MySQL DB.",
                    data
                )
                return True
            else:
                self.log_result("Cleanup Society", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Cleanup Society", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all comprehensive backend tests in specified order"""
        print("=" * 80)
        print("COMPREHENSIVE BACKEND API TESTING - Society Management System")
        print("MySQL Multi-Tenant Architecture with Individual Society Databases")
        print("=" * 80)
        print(f"Base URL: {BASE_URL}")
        print()
        
        tests = [
            ("Auth Login (admin001/admin123)", self.test_auth_login),
            ("Admin Stats", self.test_admin_stats),
            ("Create Society (creates individual MySQL DB)", self.test_create_society),
            ("Get Societies List", self.test_get_societies_list),
            ("Get Society Profile (towers/flats/stats)", self.test_get_society_profile),
            ("Create Tower (auto-generates flats)", self.test_create_tower),
            ("Get Towers", self.test_get_towers),
            ("Get Flats (auto-generated)", self.test_get_flats),
            ("Create Flat Manually", self.test_create_flat_manually),
            ("Society Level Endpoints (x-society-id header)", self.test_society_level_endpoints),
            ("Notifications", self.test_notifications),
            ("Create User", self.test_create_user),
            ("Create Team", self.test_create_team),
            ("Cleanup Society (drops individual DB)", self.test_cleanup_society),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                success = test_func()
                if success:
                    passed += 1
                else:
                    failed += 1
                time.sleep(0.5)  # Brief pause between tests
            except Exception as e:
                print(f"❌ FAIL: {test_name} - Exception: {str(e)}")
                failed += 1
        
        print("=" * 80)
        print("COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"- {result['test']}: {result['message']}")
        else:
            print("\n🎉 ALL TESTS PASSED! The MySQL multi-tenant backend rewrite is working correctly.")
        
        return failed == 0

def main():
    """Main function to run comprehensive backend tests"""
    tester = ComprehensiveBackendTester()
    
    try:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()