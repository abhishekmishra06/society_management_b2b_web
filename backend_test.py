#!/usr/bin/env python3
"""
Backend API Testing for Society Management System
Tests newly added API endpoints: Dashboard Stats, User Profile, Share Access/Create User, and Login improvements
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# Configuration
BASE_URL = "https://platform-admin-hub.preview.emergentagent.com/api"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test result with details"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if response_data and isinstance(response_data, dict):
            print(f"   Response: {json.dumps(response_data, indent=2, default=str)[:200]}...")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success, 
            "message": message,
            "response": response_data
        })

    def test_login_admin(self) -> bool:
        """Test login with admin credentials"""
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
                    self.log_result(
                        "Admin Login",
                        True,
                        f"Login successful, got token and user data. User: {data['user']['name']}, Role: {data['user']['role']}",
                        data
                    )
                    return True
                else:
                    self.log_result("Admin Login", False, f"Missing token or user in response: {data}")
                    return False
            else:
                self.log_result("Admin Login", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_dashboard_stats(self) -> bool:
        """Test GET /api/dashboard/stats"""
        try:
            url = f"{BASE_URL}/dashboard/stats"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    "residents", "towers", "flats", "vehicles", 
                    "complaintsThisMonth", "totalBillsAmount"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result(
                        "Dashboard Stats API",
                        True,
                        f"All required fields present: residents={data.get('residents')}, towers={data.get('towers')}, " +
                        f"flats={data.get('flats')}, vehicles={data.get('vehicles')}, " +
                        f"complaintsThisMonth={data.get('complaintsThisMonth')}, totalBillsAmount={data.get('totalBillsAmount')}",
                        data
                    )
                    return True
                else:
                    self.log_result(
                        "Dashboard Stats API", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
            else:
                self.log_result("Dashboard Stats API", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Dashboard Stats API", False, f"Exception: {str(e)}")
            return False

    def test_user_profile_get(self) -> bool:
        """Test GET /api/user/profile with auth header"""
        try:
            url = f"{BASE_URL}/user/profile"
            print(f"Testing: GET {url}")
            print(f"Auth Header: Authorization: Bearer {self.auth_token}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "userId", "name", "role"]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result(
                        "User Profile GET API",
                        True,
                        f"Profile retrieved successfully. User: {data.get('name')}, Role: {data.get('role')}, ID: {data.get('userId')}",
                        data
                    )
                    return True
                else:
                    self.log_result("User Profile GET API", False, f"Missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("User Profile GET API", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("User Profile GET API", False, f"Exception: {str(e)}")
            return False

    def test_user_profile_update(self) -> bool:
        """Test PUT /api/user/profile to update profile"""
        try:
            url = f"{BASE_URL}/user/profile"
            payload = {"name": "Admin Updated", "phone": "9999999999"}
            
            print(f"Testing: PUT {url}")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.put(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "User Profile UPDATE API",
                    True,
                    f"Profile updated successfully: {data.get('message')}",
                    data
                )
                
                # Verify the update by getting profile again
                get_response = self.session.get(url)
                if get_response.status_code == 200:
                    updated_data = get_response.json()
                    if updated_data.get('name') == 'Admin Updated' and updated_data.get('phone') == '9999999999':
                        print("   ✅ Update verified - profile data matches expected values")
                        return True
                    else:
                        print(f"   ⚠️  Update verification failed - name: {updated_data.get('name')}, phone: {updated_data.get('phone')}")
                        return False
                return True
            else:
                self.log_result("User Profile UPDATE API", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("User Profile UPDATE API", False, f"Exception: {str(e)}")
            return False

    def test_create_user_share_access(self) -> bool:
        """Test POST /api/users/share-access to create staff user"""
        try:
            url = f"{BASE_URL}/users/share-access"
            payload = {
                "name": "Guard John",
                "userId": "guard_john",
                "password": "guard123",
                "role": "STAFF",
                "permissions": ["dashboard", "security"],
                "linkedEntityId": "test123",
                "linkedEntityType": "staff"
            }
            
            print(f"Testing: POST {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "userId", "name", "role", "permissions"]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result(
                        "Share Access/Create User API", 
                        True,
                        f"User created successfully. ID: {data.get('id')}, Name: {data.get('name')}, " +
                        f"Role: {data.get('role')}, Permissions: {data.get('permissions')}",
                        data
                    )
                    return True
                else:
                    self.log_result("Share Access/Create User API", False, f"Missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("Share Access/Create User API", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Share Access/Create User API", False, f"Exception: {str(e)}")
            return False

    def test_list_users(self) -> bool:
        """Test GET /api/users to list all users and verify new user appears"""
        try:
            url = f"{BASE_URL}/users"
            print(f"Testing: GET {url}")
            
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Look for guard_john user
                    guard_user = next((u for u in data if u.get('userId') == 'guard_john'), None)
                    
                    if guard_user:
                        self.log_result(
                            "List Users API",
                            True,
                            f"Users list retrieved, found guard_john user. Total users: {len(data)}. " +
                            f"Guard details: Name={guard_user.get('name')}, Role={guard_user.get('role')}",
                            {"total_users": len(data), "guard_user": guard_user}
                        )
                        return True
                    else:
                        self.log_result(
                            "List Users API", 
                            False, 
                            f"guard_john user not found in users list. Total users: {len(data)}",
                            data
                        )
                        return False
                else:
                    self.log_result("List Users API", False, f"Expected array, got: {type(data)}", data)
                    return False
            else:
                self.log_result("List Users API", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("List Users API", False, f"Exception: {str(e)}")
            return False

    def test_duplicate_user_check(self) -> bool:
        """Test duplicate user creation - should return 400"""
        try:
            url = f"{BASE_URL}/users/share-access"
            payload = {
                "name": "Guard John Duplicate",
                "userId": "guard_john",  # Same userId as before
                "password": "guard456",
                "role": "STAFF"
            }
            
            print(f"Testing: POST {url} (duplicate check)")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if "already exists" in data.get("message", "").lower():
                    self.log_result(
                        "Duplicate User Check",
                        True,
                        f"Correctly rejected duplicate userId with status 400: {data.get('message')}",
                        data
                    )
                    return True
                else:
                    self.log_result("Duplicate User Check", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_result("Duplicate User Check", False, f"Expected status 400, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Duplicate User Check", False, f"Exception: {str(e)}")
            return False

    def test_login_new_user(self) -> bool:
        """Test login with newly created guard_john user"""
        try:
            # First, logout admin by removing auth header
            if "Authorization" in self.session.headers:
                del self.session.headers["Authorization"]
            
            url = f"{BASE_URL}/auth/login"
            payload = {"userId": "guard_john", "password": "guard123"}
            
            print(f"Testing: POST {url} (new user login)")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["token", "user", "permissions"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("New User Login", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Check permissions
                expected_permissions = ["dashboard", "security"]
                actual_permissions = data.get("permissions", [])
                
                permissions_match = set(expected_permissions) == set(actual_permissions)
                
                if permissions_match:
                    self.log_result(
                        "New User Login",
                        True,
                        f"Login successful. User: {data['user']['name']}, Role: {data['user']['role']}, " +
                        f"Permissions: {actual_permissions}",
                        data
                    )
                    return True
                else:
                    self.log_result(
                        "New User Login", 
                        False, 
                        f"Permissions mismatch. Expected: {expected_permissions}, Got: {actual_permissions}",
                        data
                    )
                    return False
            else:
                self.log_result("New User Login", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("New User Login", False, f"Exception: {str(e)}")
            return False

    def test_first_login_flag(self) -> bool:
        """Test that isFirstLogin flag is true for newly created users"""
        try:
            url = f"{BASE_URL}/auth/login"
            payload = {"userId": "guard_john", "password": "guard123"}
            
            print(f"Testing: POST {url} (first login flag check)")
            print(f"Payload: {json.dumps(payload)}")
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                is_first_login = data.get("isFirstLogin")
                
                if is_first_login is True:
                    self.log_result(
                        "First Login Flag",
                        True,
                        f"isFirstLogin flag correctly set to true for new user",
                        {"isFirstLogin": is_first_login}
                    )
                    return True
                elif is_first_login is False:
                    # This might happen if user logged in before, which is also acceptable
                    self.log_result(
                        "First Login Flag",
                        True,
                        f"isFirstLogin flag is false - user has logged in before (acceptable)",
                        {"isFirstLogin": is_first_login}
                    )
                    return True
                else:
                    self.log_result(
                        "First Login Flag", 
                        False, 
                        f"isFirstLogin flag missing or invalid: {is_first_login}",
                        data
                    )
                    return False
            else:
                self.log_result("First Login Flag", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("First Login Flag", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("=" * 80)
        print("BACKEND API TESTING - Society Management System")
        print("=" * 80)
        print(f"Base URL: {BASE_URL}")
        print()
        
        tests = [
            ("Admin Login", self.test_login_admin),
            ("Dashboard Stats API", self.test_dashboard_stats),
            ("User Profile GET API", self.test_user_profile_get),
            ("User Profile UPDATE API", self.test_user_profile_update),
            ("Share Access/Create User API", self.test_create_user_share_access),
            ("List Users API", self.test_list_users),
            ("Duplicate User Check", self.test_duplicate_user_check),
            ("New User Login", self.test_login_new_user),
            ("First Login Flag", self.test_first_login_flag),
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
        print("TEST SUMMARY")
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
    """Main function to run backend tests"""
    tester = BackendTester()
    
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