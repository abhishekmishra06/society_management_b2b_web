#!/usr/bin/env python3

import requests
import json
from datetime import datetime
import sys

# Base URL for the API
BASE_URL = "https://community-hub-525.preview.emergentagent.com/api"

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    default_headers = {'Content-Type': 'application/json'}
    if headers:
        default_headers.update(headers)
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=default_headers, timeout=30)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=default_headers, timeout=30)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=default_headers, timeout=30)
        elif method == 'DELETE':
            response = requests.delete(url, headers=default_headers, timeout=30)
        
        return response
    except requests.exceptions.Timeout:
        print(f"❌ TIMEOUT: {method} {endpoint} - Request timed out")
        return None
    except requests.exceptions.ConnectionError:
        print(f"❌ CONNECTION ERROR: {method} {endpoint} - Could not connect")
        return None
    except Exception as e:
        print(f"❌ ERROR: {method} {endpoint} - {str(e)}")
        return None

def test_vendor_contracts():
    """Test Vendor Contracts CRUD API"""
    print("\n=== Testing Vendor Contracts API ===")
    
    try:
        # Test GET /vendors/contracts - List all contracts
        print("1. Testing GET /vendors/contracts...")
        response = make_request('GET', '/vendors/contracts')
        if response and response.status_code == 200:
            contracts = response.json()
            print(f"✅ GET /vendors/contracts successful - returned {len(contracts)} contracts")
            if not isinstance(contracts, list):
                print(f"⚠️  Expected array but got {type(contracts)}")
        else:
            print(f"❌ GET /vendors/contracts failed - Status: {response.status_code if response else 'No Response'}")
            return False
        
        # Test POST /vendors/contracts - Create new contract
        print("2. Testing POST /vendors/contracts...")
        contract_data = {
            "vendorName": "Test Cleaning Co",
            "serviceType": "Housekeeping", 
            "startDate": "2026-01-01",
            "expiryDate": "2026-12-31",
            "amount": 50000,
            "terms": "Monthly service"
        }
        
        response = make_request('POST', '/vendors/contracts', contract_data)
        if response and response.status_code == 200:
            new_contract = response.json()
            print(f"✅ POST /vendors/contracts successful - Created contract with ID: {new_contract.get('id', 'No ID')}")
            
            # Verify contract has required fields
            if 'id' not in new_contract:
                print("⚠️  Created contract missing 'id' field")
            if new_contract.get('vendorName') != contract_data['vendorName']:
                print("⚠️  Vendor name mismatch")
                
            # Test GET again to verify contract was added
            print("3. Verifying contract was added...")
            response = make_request('GET', '/vendors/contracts')
            if response and response.status_code == 200:
                updated_contracts = response.json()
                print(f"✅ Verification successful - now {len(updated_contracts)} contracts")
                
                # Check if our contract exists
                found = any(c.get('id') == new_contract.get('id') for c in updated_contracts)
                if found:
                    print("✅ Created contract found in list")
                else:
                    print("⚠️  Created contract not found in list")
            else:
                print("❌ Failed to verify contract creation")
                
        else:
            print(f"❌ POST /vendors/contracts failed - Status: {response.status_code if response else 'No Response'}")
            if response:
                print(f"Response: {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Exception in vendor contracts test: {str(e)}")
        return False

def test_vendor_payments():
    """Test Vendor Payments CRUD API"""
    print("\n=== Testing Vendor Payments API ===")
    
    try:
        # Test GET /vendors/payments - List all payments
        print("1. Testing GET /vendors/payments...")
        response = make_request('GET', '/vendors/payments')
        if response and response.status_code == 200:
            payments = response.json()
            print(f"✅ GET /vendors/payments successful - returned {len(payments)} payments")
            if not isinstance(payments, list):
                print(f"⚠️  Expected array but got {type(payments)}")
        else:
            print(f"❌ GET /vendors/payments failed - Status: {response.status_code if response else 'No Response'}")
            return False
        
        # Test POST /vendors/payments - Create new payment
        print("2. Testing POST /vendors/payments...")
        payment_data = {
            "vendorName": "Test Cleaning Co",
            "serviceType": "Housekeeping",
            "amount": 25000,
            "invoiceNumber": "INV-2026-TEST",
            "paymentMethod": "Bank Transfer",
            "status": "completed"
        }
        
        response = make_request('POST', '/vendors/payments', payment_data)
        if response and response.status_code == 200:
            new_payment = response.json()
            print(f"✅ POST /vendors/payments successful - Created payment with ID: {new_payment.get('id', 'No ID')}")
            
            # Verify payment has required fields
            if 'id' not in new_payment:
                print("⚠️  Created payment missing 'id' field")
            if new_payment.get('vendorName') != payment_data['vendorName']:
                print("⚠️  Vendor name mismatch")
            if new_payment.get('amount') != payment_data['amount']:
                print("⚠️  Amount mismatch")
                
            # Test GET again to verify payment was added
            print("3. Verifying payment was added...")
            response = make_request('GET', '/vendors/payments')
            if response and response.status_code == 200:
                updated_payments = response.json()
                print(f"✅ Verification successful - now {len(updated_payments)} payments")
                
                # Check if our payment exists
                found = any(p.get('id') == new_payment.get('id') for p in updated_payments)
                if found:
                    print("✅ Created payment found in list")
                else:
                    print("⚠️  Created payment not found in list")
            else:
                print("❌ Failed to verify payment creation")
                
        else:
            print(f"❌ POST /vendors/payments failed - Status: {response.status_code if response else 'No Response'}")
            if response:
                print(f"Response: {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Exception in vendor payments test: {str(e)}")
        return False

def test_facilities():
    """Test Facilities and Facility Bookings CRUD API"""
    print("\n=== Testing Facilities API ===")
    
    try:
        # Test GET /facilities - List all facilities
        print("1. Testing GET /facilities...")
        response = make_request('GET', '/facilities')
        if response and response.status_code == 200:
            facilities = response.json()
            print(f"✅ GET /facilities successful - returned {len(facilities)} facilities")
            if not isinstance(facilities, list):
                print(f"⚠️  Expected array but got {type(facilities)}")
        else:
            print(f"❌ GET /facilities failed - Status: {response.status_code if response else 'No Response'}")
            return False
        
        # Test POST /facilities - Create new facility
        print("2. Testing POST /facilities...")
        facility_data = {
            "name": "Swimming Pool",
            "description": "Olympic size pool", 
            "capacity": 30,
            "rate": 1500
        }
        
        response = make_request('POST', '/facilities', facility_data)
        if response and response.status_code == 200:
            new_facility = response.json()
            print(f"✅ POST /facilities successful - Created facility with ID: {new_facility.get('id', 'No ID')}")
            
            # Verify facility has required fields
            if 'id' not in new_facility:
                print("⚠️  Created facility missing 'id' field")
            if new_facility.get('name') != facility_data['name']:
                print("⚠️  Facility name mismatch")
                
            # Test GET again to verify facility was added
            print("3. Verifying facility was added...")
            response = make_request('GET', '/facilities')
            if response and response.status_code == 200:
                updated_facilities = response.json()
                print(f"✅ Verification successful - now {len(updated_facilities)} facilities")
                
                # Check if our facility exists
                found = any(f.get('id') == new_facility.get('id') for f in updated_facilities)
                if found:
                    print("✅ Created facility found in list")
                else:
                    print("⚠️  Created facility not found in list")
            else:
                print("❌ Failed to verify facility creation")
                
        else:
            print(f"❌ POST /facilities failed - Status: {response.status_code if response else 'No Response'}")
            if response:
                print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception in facilities test: {str(e)}")
        return False

    # Test facility bookings
    try:
        # Test GET /facilities/bookings - List all bookings
        print("4. Testing GET /facilities/bookings...")
        response = make_request('GET', '/facilities/bookings')
        if response and response.status_code == 200:
            bookings = response.json()
            print(f"✅ GET /facilities/bookings successful - returned {len(bookings)} bookings")
            if not isinstance(bookings, list):
                print(f"⚠️  Expected array but got {type(bookings)}")
        else:
            print(f"❌ GET /facilities/bookings failed - Status: {response.status_code if response else 'No Response'}")
            return False
        
        # Test POST /facilities/bookings - Create new booking
        print("5. Testing POST /facilities/bookings...")
        booking_data = {
            "facilityName": "Swimming Pool",
            "flatNumber": "A-101",
            "bookingDate": "2026-03-15", 
            "timeSlot": "10:00 AM - 12:00 PM",
            "purpose": "Birthday party"
        }
        
        response = make_request('POST', '/facilities/bookings', booking_data)
        if response and response.status_code == 200:
            new_booking = response.json()
            print(f"✅ POST /facilities/bookings successful - Created booking with ID: {new_booking.get('id', 'No ID')}")
            
            # Verify booking has required fields
            if 'id' not in new_booking:
                print("⚠️  Created booking missing 'id' field")
            if new_booking.get('facilityName') != booking_data['facilityName']:
                print("⚠️  Facility name mismatch")
                
            # Test GET again to verify booking was added
            print("6. Verifying booking was added...")
            response = make_request('GET', '/facilities/bookings')
            if response and response.status_code == 200:
                updated_bookings = response.json()
                print(f"✅ Verification successful - now {len(updated_bookings)} bookings")
                
                # Check if our booking exists
                found = any(b.get('id') == new_booking.get('id') for b in updated_bookings)
                if found:
                    print("✅ Created booking found in list")
                else:
                    print("⚠️  Created booking not found in list")
            else:
                print("❌ Failed to verify booking creation")
                
        else:
            print(f"❌ POST /facilities/bookings failed - Status: {response.status_code if response else 'No Response'}")
            if response:
                print(f"Response: {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Exception in facility bookings test: {str(e)}")
        return False

def test_assets():
    """Test Assets CRUD API"""
    print("\n=== Testing Assets API ===")
    
    try:
        # Test GET /assets - List all assets
        print("1. Testing GET /assets...")
        response = make_request('GET', '/assets')
        if response and response.status_code == 200:
            assets = response.json()
            print(f"✅ GET /assets successful - returned {len(assets)} assets")
            if not isinstance(assets, list):
                print(f"⚠️  Expected array but got {type(assets)}")
        else:
            print(f"❌ GET /assets failed - Status: {response.status_code if response else 'No Response'}")
            return False
        
        # Test POST /assets - Create new asset
        print("2. Testing POST /assets...")
        asset_data = {
            "name": "Water Pump",
            "category": "Equipment",
            "value": 15000,
            "condition": "good",
            "location": "Basement"
        }
        
        response = make_request('POST', '/assets', asset_data)
        if response and response.status_code == 200:
            new_asset = response.json()
            print(f"✅ POST /assets successful - Created asset with ID: {new_asset.get('id', 'No ID')}")
            
            # Verify asset has required fields
            if 'id' not in new_asset:
                print("⚠️  Created asset missing 'id' field")
            if new_asset.get('name') != asset_data['name']:
                print("⚠️  Asset name mismatch")
            if new_asset.get('value') != asset_data['value']:
                print("⚠️  Asset value mismatch")
                
            # Test GET again to verify asset was added
            print("3. Verifying asset was added...")
            response = make_request('GET', '/assets')
            if response and response.status_code == 200:
                updated_assets = response.json()
                print(f"✅ Verification successful - now {len(updated_assets)} assets")
                
                # Check if our asset exists
                found = any(a.get('id') == new_asset.get('id') for a in updated_assets)
                if found:
                    print("✅ Created asset found in list")
                else:
                    print("⚠️  Created asset not found in list")
            else:
                print("❌ Failed to verify asset creation")
                
        else:
            print(f"❌ POST /assets failed - Status: {response.status_code if response else 'No Response'}")
            if response:
                print(f"Response: {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Exception in assets test: {str(e)}")
        return False

def test_parking():
    """Test Parking CRUD API"""
    print("\n=== Testing Parking API ===")
    
    try:
        # Test GET /parking - List all parking slots
        print("1. Testing GET /parking...")
        response = make_request('GET', '/parking')
        if response and response.status_code == 200:
            parking_slots = response.json()
            print(f"✅ GET /parking successful - returned {len(parking_slots)} parking slots")
            if not isinstance(parking_slots, list):
                print(f"⚠️  Expected array but got {type(parking_slots)}")
        else:
            print(f"❌ GET /parking failed - Status: {response.status_code if response else 'No Response'}")
            return False
        
        # Test POST /parking - Create new parking slot
        print("2. Testing POST /parking...")
        parking_data = {
            "slotNumber": "P-001",
            "type": "car",
            "status": "available", 
            "flatNumber": "A-101"
        }
        
        response = make_request('POST', '/parking', parking_data)
        if response and response.status_code == 200:
            new_slot = response.json()
            print(f"✅ POST /parking successful - Created parking slot with ID: {new_slot.get('id', 'No ID')}")
            
            # Verify slot has required fields
            if 'id' not in new_slot:
                print("⚠️  Created parking slot missing 'id' field")
            if new_slot.get('slotNumber') != parking_data['slotNumber']:
                print("⚠️  Slot number mismatch")
            if new_slot.get('type') != parking_data['type']:
                print("⚠️  Slot type mismatch")
                
            # Test GET again to verify slot was added
            print("3. Verifying parking slot was added...")
            response = make_request('GET', '/parking')
            if response and response.status_code == 200:
                updated_slots = response.json()
                print(f"✅ Verification successful - now {len(updated_slots)} parking slots")
                
                # Check if our slot exists
                found = any(s.get('id') == new_slot.get('id') for s in updated_slots)
                if found:
                    print("✅ Created parking slot found in list")
                else:
                    print("⚠️  Created parking slot not found in list")
            else:
                print("❌ Failed to verify parking slot creation")
                
        else:
            print(f"❌ POST /parking failed - Status: {response.status_code if response else 'No Response'}")
            if response:
                print(f"Response: {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Exception in parking test: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("Starting Backend API Tests for Society Management System")
    print(f"Base URL: {BASE_URL}")
    print("=" * 60)
    
    test_results = {}
    
    # Run all tests
    test_results['Vendor Contracts'] = test_vendor_contracts()
    test_results['Vendor Payments'] = test_vendor_payments()
    test_results['Facilities'] = test_facilities()
    test_results['Assets'] = test_assets()
    test_results['Parking'] = test_parking()
    
    # Summary
    print("\n" + "=" * 60)
    print("BACKEND API TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL BACKEND API TESTS PASSED!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the detailed output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()