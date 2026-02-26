// Permission constants for role-based access control
export const PERMISSIONS = {
  // Resident Management
  VIEW_RESIDENTS: 'view_residents',
  ADD_RESIDENT: 'add_resident',
  EDIT_RESIDENT: 'edit_resident',
  DELETE_RESIDENT: 'delete_resident',
  
  // Owner Management
  VIEW_OWNERS: 'view_owners',
  MANAGE_OWNERS: 'manage_owners',
  
  // Tenant Management
  VIEW_TENANTS: 'view_tenants',
  MANAGE_TENANTS: 'manage_tenants',
  
  // Family Management
  VIEW_FAMILY: 'view_family',
  MANAGE_FAMILY: 'manage_family',
  
  // Flat & Tower
  VIEW_FLATS: 'view_flats',
  MANAGE_FLATS: 'manage_flats',
  VIEW_TOWERS: 'view_towers',
  MANAGE_TOWERS: 'manage_towers',
  
  // Vehicle
  VIEW_VEHICLES: 'view_vehicles',
  MANAGE_VEHICLES: 'manage_vehicles',
  
  // KYC
  VIEW_KYC: 'view_kyc',
  APPROVE_KYC: 'approve_kyc',
  
  // Billing
  VIEW_BILLING: 'view_billing',
  MANAGE_BILLING: 'manage_billing',
  
  // Visitors
  VIEW_VISITORS: 'view_visitors',
  MANAGE_VISITORS: 'manage_visitors',
  
  // Staff
  VIEW_STAFF: 'view_staff',
  MANAGE_STAFF: 'manage_staff',
  
  // Emergency
  TRIGGER_EMERGENCY: 'trigger_emergency',
  RESPOND_EMERGENCY: 'respond_emergency',
  
  // Admin
  FULL_ACCESS: 'full_access',
};

// Role definitions
export const ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: [PERMISSIONS.FULL_ACCESS],
  },
  ADMIN: {
    name: 'Admin',
    permissions: [
      PERMISSIONS.VIEW_RESIDENTS,
      PERMISSIONS.ADD_RESIDENT,
      PERMISSIONS.EDIT_RESIDENT,
      PERMISSIONS.VIEW_OWNERS,
      PERMISSIONS.MANAGE_OWNERS,
      PERMISSIONS.VIEW_TENANTS,
      PERMISSIONS.MANAGE_TENANTS,
      PERMISSIONS.VIEW_FLATS,
      PERMISSIONS.MANAGE_FLATS,
      PERMISSIONS.VIEW_VEHICLES,
      PERMISSIONS.MANAGE_VEHICLES,
      PERMISSIONS.VIEW_KYC,
      PERMISSIONS.APPROVE_KYC,
      PERMISSIONS.VIEW_BILLING,
      PERMISSIONS.MANAGE_BILLING,
    ],
  },
  SECURITY: {
    name: 'Security',
    permissions: [
      PERMISSIONS.VIEW_VISITORS,
      PERMISSIONS.MANAGE_VISITORS,
      PERMISSIONS.VIEW_VEHICLES,
      PERMISSIONS.RESPOND_EMERGENCY,
    ],
  },
  RESIDENT: {
    name: 'Resident',
    permissions: [
      PERMISSIONS.VIEW_FAMILY,
      PERMISSIONS.MANAGE_FAMILY,
      PERMISSIONS.VIEW_VEHICLES,
      PERMISSIONS.TRIGGER_EMERGENCY,
    ],
  },
};
