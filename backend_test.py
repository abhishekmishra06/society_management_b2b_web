#!/usr/bin/env python3
"""
Backend API Testing Script for Society Management System
Tests all priority backend endpoints as specified in test_result.md
"""

import requests
import json
import time
import sys
from datetime import datetime, timezone

# Configuration
BASE_URL = "https://resident-hub-preview-1.preview.emergentagent.com/api"
LOGIN_CREDENTIALS = {
    "userId": "admin001", 
    "password": "admin123"
}

class APITester:
    def __init__(self):
        self.auth_token = None
        self.user_data = None
        self.towers = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Testing-Agent/1.0'
        })
        
    def log_test(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        print()

    def authenticate(self):
        """Test login endpoint and get auth token"""
        try:
            print("🔐 Testing Authentication...")
            
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=LOGIN_CREDENTIALS,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ['token', 'user', 'towers']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Login Response Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                self.auth_token = data['token']
                self.user_data = data['user']
                self.towers = data['towers']
                
                # Set auth header for future requests
                self.session.headers.update({
                    'Authorization': f'Bearer {self.auth_token}'
                })
                
                self.log_test("Login Authentication", True, 
                             f"User: {self.user_data.get('name', 'N/A')}, Towers: {len(self.towers)}")
                return True
            else:
                self.log_test("Login Authentication", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Login Authentication", False, f"Exception: {str(e)}")
            return False

    def test_emergency_trigger(self):
        """Test POST /api/emergency/trigger"""
        try:
            print("🚨 Testing Emergency Trigger...")
            
            emergency_data = {
                "type": "security",
                "message": "Test security emergency - Backend testing",
                "location": "Tower A",
                "flatNumber": "A-101",
                "tower": "Tower A"
            }
            
            response = self.session.post(
                f"{BASE_URL}/emergency/trigger",
                json=emergency_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ['id', 'type', 'message', 'status', 'timestamp']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Emergency Trigger", False, f"Missing fields: {missing_fields}")
                    return None
                
                if data.get('status') != 'active':
                    self.log_test("Emergency Trigger", False, f"Expected status 'active', got '{data.get('status')}'")
                    return None
                
                self.log_test("Emergency Trigger", True, 
                             f"Emergency ID: {data['id']}, Status: {data['status']}")
                return data['id']  # Return emergency ID for later tests
            else:
                self.log_test("Emergency Trigger", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return None
                
        except Exception as e:
            self.log_test("Emergency Trigger", False, f"Exception: {str(e)}")
            return None

    def test_emergency_active(self):
        """Test GET /api/emergency/active"""
        try:
            print("📋 Testing Active Emergencies List...")
            
            response = self.session.get(
                f"{BASE_URL}/emergency/active",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Active Emergencies List", False, "Response is not an array")
                    return False
                
                self.log_test("Active Emergencies List", True, 
                             f"Found {len(data)} active emergencies")
                return True
            else:
                self.log_test("Active Emergencies List", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Active Emergencies List", False, f"Exception: {str(e)}")
            return False

    def test_emergency_resolve(self, emergency_id):
        """Test POST /api/emergency/{id}/resolve"""
        try:
            print("✅ Testing Emergency Resolve...")
            
            if not emergency_id:
                self.log_test("Emergency Resolve", False, "No emergency ID available from trigger test")
                return False
            
            response = self.session.post(
                f"{BASE_URL}/emergency/{emergency_id}/resolve",
                json={},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'message' not in data:
                    self.log_test("Emergency Resolve", False, "No message in response")
                    return False
                
                self.log_test("Emergency Resolve", True, 
                             f"Emergency {emergency_id} resolved successfully")
                return True
            else:
                self.log_test("Emergency Resolve", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Emergency Resolve", False, f"Exception: {str(e)}")
            return False

    def test_gate_pass_get(self):
        """Test GET /api/gate-pass"""
        try:
            print("🎫 Testing Gate Pass List...")
            
            response = self.session.get(
                f"{BASE_URL}/gate-pass",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Gate Pass List", False, "Response is not an array")
                    return False
                
                self.log_test("Gate Pass List", True, 
                             f"Found {len(data)} gate passes")
                return True
            else:
                self.log_test("Gate Pass List", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Gate Pass List", False, f"Exception: {str(e)}")
            return False

    def test_gate_pass_create(self):
        """Test POST /api/gate-pass"""
        try:
            print("➕ Testing Gate Pass Creation...")
            
            gate_pass_data = {
                "flatNumber": "A-101",
                "visitorName": "Raj Sharma", 
                "purpose": "Backend API Testing Visit",
                "validFrom": "2026-03-01T10:00:00.000Z",
                "validUntil": "2026-03-01T18:00:00.000Z"
            }
            
            response = self.session.post(
                f"{BASE_URL}/gate-pass",
                json=gate_pass_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ['id', 'flatNumber', 'visitorName', 'qrCode', 'status']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Gate Pass Creation", False, f"Missing fields: {missing_fields}")
                    return False
                
                if data.get('status') != 'active':
                    self.log_test("Gate Pass Creation", False, f"Expected status 'active', got '{data.get('status')}'")
                    return False
                
                self.log_test("Gate Pass Creation", True, 
                             f"Gate Pass ID: {data['id']}, Visitor: {data['visitorName']}")
                return True
            else:
                self.log_test("Gate Pass Creation", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Gate Pass Creation", False, f"Exception: {str(e)}")
            return False

    def test_payments(self):
        """Test GET /api/billing/payments"""
        try:
            print("💳 Testing Payments List...")
            
            response = self.session.get(
                f"{BASE_URL}/billing/payments",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Payments List", False, "Response is not an array")
                    return False
                
                self.log_test("Payments List", True, 
                             f"Found {len(data)} payments")
                return True
            else:
                self.log_test("Payments List", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Payments List", False, f"Exception: {str(e)}")
            return False

    def test_towers(self):
        """Test GET /api/towers"""
        try:
            print("🏢 Testing Towers List...")
            
            response = self.session.get(
                f"{BASE_URL}/towers",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Towers List", False, "Response is not an array")
                    return False
                
                self.log_test("Towers List", True, 
                             f"Found {len(data)} towers")
                return True
            else:
                self.log_test("Towers List", False, 
                             f"Status: {response.status_code}, Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Towers List", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests in priority order"""
        print("=" * 60)
        print("🚀 SOCIETY MANAGEMENT SYSTEM - BACKEND API TESTING")
        print("=" * 60)
        print(f"Testing Base URL: {BASE_URL}")
        print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
        print("=" * 60)
        
        # Track test results
        results = {}
        
        # 1. Authentication (Critical - Required for other tests)
        results['login'] = self.authenticate()
        
        if not results['login']:
            print("❌ CRITICAL: Authentication failed. Cannot continue with other tests.")
            return results
        
        # Wait a bit for any async operations
        time.sleep(1)
        
        # 2. Emergency endpoints (High Priority)
        emergency_id = self.test_emergency_trigger()
        results['emergency_trigger'] = emergency_id is not None
        
        time.sleep(0.5)
        
        results['emergency_active'] = self.test_emergency_active()
        
        time.sleep(0.5)
        
        results['emergency_resolve'] = self.test_emergency_resolve(emergency_id)
        
        time.sleep(0.5)
        
        # 3. Gate Pass endpoints (Medium Priority)
        results['gate_pass_get'] = self.test_gate_pass_get()
        
        time.sleep(0.5)
        
        results['gate_pass_create'] = self.test_gate_pass_create()
        
        time.sleep(0.5)
        
        # 4. Payments endpoint (Medium Priority - had previous issues)
        results['payments'] = self.test_payments()
        
        time.sleep(0.5)
        
        # 5. Towers endpoint (Low Priority)
        results['towers'] = self.test_towers()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} - {test_name}")
        
        print("=" * 60)
        print(f"📈 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 All backend tests PASSED!")
        else:
            print("⚠️  Some backend tests FAILED - check details above")
        
        return results

def main():
    """Main function to run backend tests"""
    tester = APITester()
    results = tester.run_all_tests()
    
    # Exit with error code if any critical tests failed
    critical_tests = ['login', 'emergency_trigger', 'emergency_active', 'emergency_resolve']
    critical_failures = [test for test in critical_tests if not results.get(test, False)]
    
    if critical_failures:
        print(f"\n❌ CRITICAL FAILURES: {critical_failures}")
        sys.exit(1)
    else:
        print(f"\n✅ All critical backend functions working properly")
        sys.exit(0)

if __name__ == "__main__":
    main()