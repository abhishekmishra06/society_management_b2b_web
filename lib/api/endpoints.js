// Centralized API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY_OTP: '/auth/verify-otp',
  
  // User
  GET_USER_PROFILE: '/user/profile',
  GET_USER_PERMISSIONS: '/user/permissions',
  
  // Residents
  GET_RESIDENTS: '/residents',
  GET_RESIDENT: (id) => `/residents/${id}`,
  CREATE_RESIDENT: '/residents',
  UPDATE_RESIDENT: (id) => `/residents/${id}`,
  DELETE_RESIDENT: (id) => `/residents/${id}`,
  DEACTIVATE_RESIDENT: (id) => `/residents/${id}/deactivate`,
  
  // Owners
  GET_OWNERS: '/owners',
  GET_OWNER: (id) => `/owners/${id}`,
  CREATE_OWNER: '/owners',
  UPDATE_OWNER: (id) => `/owners/${id}`,
  
  // Tenants
  GET_TENANTS: '/tenants',
  GET_TENANT: (id) => `/tenants/${id}`,
  CREATE_TENANT: '/tenants',
  UPDATE_TENANT: (id) => `/tenants/${id}`,
  
  // Family Members
  GET_FAMILY_MEMBERS: (residentId) => `/residents/${residentId}/family`,
  ADD_FAMILY_MEMBER: (residentId) => `/residents/${residentId}/family`,
  UPDATE_FAMILY_MEMBER: (residentId, memberId) => `/residents/${residentId}/family/${memberId}`,
  DELETE_FAMILY_MEMBER: (residentId, memberId) => `/residents/${residentId}/family/${memberId}`,
  
  // Towers
  GET_TOWERS: '/towers',
  GET_TOWER: (id) => `/towers/${id}`,
  CREATE_TOWER: '/towers',
  UPDATE_TOWER: (id) => `/towers/${id}`,
  DELETE_TOWER: (id) => `/towers/${id}`,
  
  // Flats
  GET_FLATS: '/flats',
  GET_FLAT: (id) => `/flats/${id}`,
  CREATE_FLAT: '/flats',
  UPDATE_FLAT: (id) => `/flats/${id}`,
  DELETE_FLAT: (id) => `/flats/${id}`,
  GET_FLAT_OCCUPANCY: (id) => `/flats/${id}/occupancy`,
  
  // Vehicles
  GET_VEHICLES: '/vehicles',
  GET_VEHICLE: (id) => `/vehicles/${id}`,
  CREATE_VEHICLE: '/vehicles',
  UPDATE_VEHICLE: (id) => `/vehicles/${id}`,
  DELETE_VEHICLE: (id) => `/vehicles/${id}`,
  
  // KYC
  GET_KYC_REQUESTS: '/kyc',
  GET_KYC_REQUEST: (id) => `/kyc/${id}`,
  SUBMIT_KYC: '/kyc',
  APPROVE_KYC: (id) => `/kyc/${id}/approve`,
  REJECT_KYC: (id) => `/kyc/${id}/reject`,
  
  // Emergency
  TRIGGER_EMERGENCY: '/emergency/trigger',
  GET_ACTIVE_EMERGENCIES: '/emergency/active',
  RESOLVE_EMERGENCY: (id) => `/emergency/${id}/resolve`,
  
  // SMS
  SEND_SMS: '/sms/send',
  
  // Billing & Finance
  GET_MAINTENANCE_BILLS: '/billing/maintenance',
  CREATE_MAINTENANCE_BILL: '/billing/maintenance',
  GET_UTILITY_BILLS: '/billing/utility',
  CREATE_UTILITY_BILL: '/billing/utility',
  GET_PAYMENTS: '/billing/payments',
  CREATE_PAYMENT: '/billing/payments',
  GET_EXPENSES: '/billing/expenses',
  CREATE_EXPENSE: '/billing/expenses',
  GET_LEDGER: '/billing/ledger',
  CREATE_LEDGER_ENTRY: '/billing/ledger',
  
  // Visitors & Security
  GET_VISITORS: '/visitors',
  CREATE_VISITOR: '/visitors',
  APPROVE_VISITOR: (id) => `/visitors/${id}/approve`,
  EXIT_VISITOR: (id) => `/visitors/${id}/exit`,
  GET_GATE_PASSES: '/gate-pass',
  CREATE_GATE_PASS: '/gate-pass',
  GET_BLACKLIST: '/blacklist',
  ADD_TO_BLACKLIST: '/blacklist',
  
  // Staff
  GET_STAFF: '/staff',
  CREATE_STAFF: '/staff',
  GET_STAFF_ATTENDANCE: '/staff/attendance',
  MARK_ATTENDANCE: '/staff/attendance',
  GET_STAFF_SALARY: '/staff/salary',
  CREATE_SALARY: '/staff/salary',
  
  // Vendors
  GET_VENDORS: '/vendors',
  CREATE_VENDOR: '/vendors',
  GET_VENDOR_CONTRACTS: '/vendors/contracts',
  CREATE_CONTRACT: '/vendors/contracts',
  GET_VENDOR_PAYMENTS: '/vendors/payments',
  CREATE_VENDOR_PAYMENT: '/vendors/payments',
  
  // Communication
  GET_NOTICES: '/notices',
  CREATE_NOTICE: '/notices',
  GET_ANNOUNCEMENTS: '/announcements',
  CREATE_ANNOUNCEMENT: '/announcements',
  
  // Complaints
  GET_COMPLAINTS: '/complaints',
  CREATE_COMPLAINT: '/complaints',
  UPDATE_COMPLAINT: (id) => `/complaints/${id}`,
  
  // Facilities & Assets
  GET_FACILITIES: '/facilities',
  CREATE_FACILITY: '/facilities',
  GET_FACILITY_BOOKINGS: '/facilities/bookings',
  CREATE_BOOKING: '/facilities/bookings',
  GET_ASSETS: '/assets',
  CREATE_ASSET: '/assets',
  GET_AMC: '/amc',
  CREATE_AMC: '/amc',
  
  // Parking & Move
  GET_PARKING: '/parking',
  CREATE_PARKING_SLOT: '/parking',
  GET_MOVE_REQUESTS: '/move',
  CREATE_MOVE_REQUEST: '/move',
  GET_DOCUMENTS: '/documents',
  UPLOAD_DOCUMENT: '/documents',
};
