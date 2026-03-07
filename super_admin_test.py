#!/usr/bin/env python3
"""
Super Admin API Testing for Society Management System
Tests Super Admin endpoints: Admin Stats, Society CRUD, Admin User CRUD, Team CRUD
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# Configuration
BASE_URL = "https://quirky-sinoussi-5.preview.emergentagent.com/api"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

class SuperAdminTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.auth_token = None
        self.test_results = []
        self.society_id = None
        self.user_id = None
        self.team_id = None
        
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

    def test_login_admin(self) -> bool:
        """Test login with admin001/admin123 credentials"""
        try:
            url = f"{BASE_URL}/auth/login"
            payload = {"userId": "admin001", "password": "admin123"}
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.auth_token = data["token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    user_role = data.get("user", {}).get("role")
                    
                    if user_role == "SUPER_ADMIN":
                        self.log_result(
                            "Admin Login - Role Check",
                            True,
                            f"Login successful with SUPER_ADMIN role. User: {data['user']['name']}, Role: {user_role}",
                            data
                        )
                        return True
                    else:
                        self.log_result(
                            "Admin Login - Role Check", 
                            False, 
                            f"Expected SUPER_ADMIN role, got: {user_role}",
                            data
                        )
                        return False
                else:
                    self.log_result("Admin Login - Role Check", False, f"Missing token or user in response: {data}")
                    return False
            else:
                self.log_result("Admin Login - Role Check", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Login - Role Check", False, f"Exception: {str(e)}")
            return False

    def test_admin_dashboard_stats(self) -> bool:
        """Test GET /api/admin/stats"""
        try:
            url = f"{BASE_URL}/admin/stats"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    "totalSocieties", "totalUsers", "totalTeams", 
                    "activeSocieties", "adminUsers", "staffUsers", "superAdmins"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result(
                        "Admin Dashboard Stats",
                        True,
                        f"All required fields present: totalSocieties={data.get('totalSocieties')}, " +
                        f"totalUsers={data.get('totalUsers')}, totalTeams={data.get('totalTeams')}, " +
                        f"activeSocieties={data.get('activeSocieties')}, adminUsers={data.get('adminUsers')}, " +
                        f"staffUsers={data.get('staffUsers')}, superAdmins={data.get('superAdmins')}",
                        data
                    )
                    return True
                else:
                    self.log_result(
                        "Admin Dashboard Stats", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
            else:
                self.log_result("Admin Dashboard Stats", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Dashboard Stats", False, f"Exception: {str(e)}")
            return False

    def test_create_society(self) -> bool:
        """Test POST /api/admin/societies"""
        try:
            url = f"{BASE_URL}/admin/societies"
            payload = {
                "name": "Test Society",
                "city": "Mumbai",
                "state": "MH",
                "registrationNo": "SOC-TEST-001",
                "totalTowers": 5,
                "totalFlats": 100,
                "address": "Test Address, Andheri",
                "pincode": "400053",
                "phone": "9999888877",
                "email": "test@testsociety.com"
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
                        f"Society created successfully. ID: {data['id']}, Name: {data['name']}, " +
                        f"City: {data['city']}, Registration No: {data['registrationNo']}",
                        data
                    )
                    return True
                else:
                    self.log_result("Create Society", False, f"Missing ID or name in response: {data}")
                    return False
            else:
                self.log_result("Create Society", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Society", False, f"Exception: {str(e)}")
            return False

    def test_get_societies(self) -> bool:
        """Test GET /api/admin/societies"""
        try:
            url = f"{BASE_URL}/admin/societies"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Look for our created society
                    created_society = None
                    if self.society_id:
                        created_society = next((s for s in data if s.get('id') == self.society_id), None)
                    
                    if created_society:
                        self.log_result(
                            "Get Societies",
                            True,
                            f"Societies list retrieved, found created society. Total: {len(data)}, " +
                            f"Created society: {created_society['name']} (ID: {created_society['id']})",
                            {"total_societies": len(data), "created_society": created_society}
                        )
                        return True
                    else:
                        self.log_result(
                            "Get Societies",
                            True,
                            f"Societies list retrieved successfully. Total societies: {len(data)}",
                            {"total_societies": len(data)}
                        )
                        return True
                else:
                    self.log_result("Get Societies", False, f"Expected array, got: {type(data)}", data)
                    return False
            else:
                self.log_result("Get Societies", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Societies", False, f"Exception: {str(e)}")
            return False

    def test_update_society(self) -> bool:
        """Test PUT /api/admin/societies/{id}"""
        if not self.society_id:
            self.log_result("Update Society", False, "No society ID available for update test")
            return False
            
        try:
            url = f"{BASE_URL}/admin/societies/{self.society_id}"
            payload = {
                "name": "Test Society Updated",
                "phone": "9999888877"
            }
            
            print(f"Testing: PUT {url}")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.put(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Update Society",
                    True,
                    f"Society updated successfully: {data.get('message')}",
                    data
                )
                return True
            else:
                self.log_result("Update Society", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Society", False, f"Exception: {str(e)}")
            return False

    def test_delete_society(self) -> bool:
        """Test DELETE /api/admin/societies/{id}"""
        if not self.society_id:
            self.log_result("Delete Society", False, "No society ID available for delete test")
            return False
            
        try:
            url = f"{BASE_URL}/admin/societies/{self.society_id}"
            print(f"Testing: DELETE {url}")
            
            response = self.session.delete(url)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Delete Society",
                    True,
                    f"Society deleted successfully: {data.get('message')}",
                    data
                )
                return True
            else:
                self.log_result("Delete Society", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Delete Society", False, f"Exception: {str(e)}")
            return False

    def test_create_admin_user(self) -> bool:
        """Test POST /api/admin/users"""
        try:
            url = f"{BASE_URL}/admin/users"
            payload = {
                "name": "Test Admin",
                "userId": "test_admin_001",
                "password": "test123",
                "role": "SOCIETY_ADMIN",
                "permissions": ["dashboard", "residents", "billing"],
                "email": "testadmin@example.com",
                "phone": "9999777766",
                "societyId": "society_test"
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "userId" in data:
                    self.user_id = data["id"]
                    self.log_result(
                        "Create Admin User",
                        True,
                        f"Admin user created successfully. ID: {data['id']}, Name: {data['name']}, " +
                        f"UserId: {data['userId']}, Role: {data['role']}, Permissions: {data['permissions']}",
                        data
                    )
                    return True
                else:
                    self.log_result("Create Admin User", False, f"Missing ID or userId in response: {data}")
                    return False
            else:
                self.log_result("Create Admin User", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Admin User", False, f"Exception: {str(e)}")
            return False

    def test_get_admin_users(self) -> bool:
        """Test GET /api/admin/users"""
        try:
            url = f"{BASE_URL}/admin/users"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Look for our created user
                    created_user = None
                    if self.user_id:
                        created_user = next((u for u in data if u.get('id') == self.user_id), None)
                    
                    if created_user:
                        self.log_result(
                            "Get Admin Users",
                            True,
                            f"Users list retrieved, found created user. Total: {len(data)}, " +
                            f"Created user: {created_user['name']} (ID: {created_user['id']})",
                            {"total_users": len(data), "created_user": created_user}
                        )
                        return True
                    else:
                        self.log_result(
                            "Get Admin Users",
                            True,
                            f"Users list retrieved successfully. Total users: {len(data)}",
                            {"total_users": len(data)}
                        )
                        return True
                else:
                    self.log_result("Get Admin Users", False, f"Expected array, got: {type(data)}", data)
                    return False
            else:
                self.log_result("Get Admin Users", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Admin Users", False, f"Exception: {str(e)}")
            return False

    def test_update_admin_user(self) -> bool:
        """Test PUT /api/admin/users/{id}"""
        if not self.user_id:
            self.log_result("Update Admin User", False, "No user ID available for update test")
            return False
            
        try:
            url = f"{BASE_URL}/admin/users/{self.user_id}"
            payload = {
                "name": "Test Admin Updated",
                "permissions": ["dashboard", "residents"]
            }
            
            print(f"Testing: PUT {url}")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.put(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Update Admin User",
                    True,
                    f"Admin user updated successfully: {data.get('message')}",
                    data
                )
                return True
            else:
                self.log_result("Update Admin User", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Admin User", False, f"Exception: {str(e)}")
            return False

    def test_delete_admin_user(self) -> bool:
        """Test DELETE /api/admin/users/{id}"""
        if not self.user_id:
            self.log_result("Delete Admin User", False, "No user ID available for delete test")
            return False
            
        try:
            url = f"{BASE_URL}/admin/users/{self.user_id}"
            print(f"Testing: DELETE {url}")
            
            response = self.session.delete(url)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Delete Admin User",
                    True,
                    f"Admin user deleted successfully: {data.get('message')}",
                    data
                )
                return True
            else:
                self.log_result("Delete Admin User", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Delete Admin User", False, f"Exception: {str(e)}")
            return False

    def test_create_team(self) -> bool:
        """Test POST /api/admin/teams"""
        try:
            url = f"{BASE_URL}/admin/teams"
            payload = {
                "name": "Security Team",
                "description": "Handles security operations",
                "permissions": ["security", "parking"],
                "societyId": "society_test",
                "members": []
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data:
                    self.team_id = data["id"]
                    self.log_result(
                        "Create Team",
                        True,
                        f"Team created successfully. ID: {data['id']}, Name: {data['name']}, " +
                        f"Description: {data['description']}, Permissions: {data['permissions']}",
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

    def test_get_teams(self) -> bool:
        """Test GET /api/admin/teams"""
        try:
            url = f"{BASE_URL}/admin/teams"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Look for our created team
                    created_team = None
                    if self.team_id:
                        created_team = next((t for t in data if t.get('id') == self.team_id), None)
                    
                    if created_team:
                        self.log_result(
                            "Get Teams",
                            True,
                            f"Teams list retrieved, found created team. Total: {len(data)}, " +
                            f"Created team: {created_team['name']} (ID: {created_team['id']})",
                            {"total_teams": len(data), "created_team": created_team}
                        )
                        return True
                    else:
                        self.log_result(
                            "Get Teams",
                            True,
                            f"Teams list retrieved successfully. Total teams: {len(data)}",
                            {"total_teams": len(data)}
                        )
                        return True
                else:
                    self.log_result("Get Teams", False, f"Expected array, got: {type(data)}", data)
                    return False
            else:
                self.log_result("Get Teams", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Teams", False, f"Exception: {str(e)}")
            return False

    def test_update_team(self) -> bool:
        """Test PUT /api/admin/teams/{id}"""
        if not self.team_id:
            self.log_result("Update Team", False, "No team ID available for update test")
            return False
            
        try:
            url = f"{BASE_URL}/admin/teams/{self.team_id}"
            payload = {
                "name": "Updated Security Team",
                "description": "Updated team description"
            }
            
            print(f"Testing: PUT {url}")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.put(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Update Team",
                    True,
                    f"Team updated successfully: {data.get('message')}",
                    data
                )
                return True
            else:
                self.log_result("Update Team", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Team", False, f"Exception: {str(e)}")
            return False

    def test_delete_team(self) -> bool:
        """Test DELETE /api/admin/teams/{id}"""
        if not self.team_id:
            self.log_result("Delete Team", False, "No team ID available for delete test")
            return False
            
        try:
            url = f"{BASE_URL}/admin/teams/{self.team_id}"
            print(f"Testing: DELETE {url}")
            
            response = self.session.delete(url)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Delete Team",
                    True,
                    f"Team deleted successfully: {data.get('message')}",
                    data
                )
                return True
            else:
                self.log_result("Delete Team", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Delete Team", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all Super Admin tests in sequence"""
        print("=" * 80)
        print("SUPER ADMIN API TESTING - Society Management System")
        print("=" * 80)
        print(f"Base URL: {BASE_URL}")
        print()
        
        tests = [
            ("Admin Login - Role Check", self.test_login_admin),
            ("Admin Dashboard Stats", self.test_admin_dashboard_stats),
            ("Create Society", self.test_create_society),
            ("Get Societies", self.test_get_societies),
            ("Update Society", self.test_update_society),
            ("Delete Society", self.test_delete_society),
            ("Create Admin User", self.test_create_admin_user),
            ("Get Admin Users", self.test_get_admin_users),
            ("Update Admin User", self.test_update_admin_user),
            ("Delete Admin User", self.test_delete_admin_user),
            ("Create Team", self.test_create_team),
            ("Get Teams", self.test_get_teams),
            ("Update Team", self.test_update_team),
            ("Delete Team", self.test_delete_team),
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
        print("SUPER ADMIN TEST SUMMARY")
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
        
        return failed == 0

def main():
    """Main function to run Super Admin tests"""
    tester = SuperAdminTester()
    
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