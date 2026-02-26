// All available permission modules for the system
export const PERMISSION_MODULES = {
  DASHBOARD: { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  RESIDENTS: { key: 'residents', label: 'Resident & Society', icon: 'Users' },
  BILLING: { key: 'billing', label: 'Billing & Finance', icon: 'Receipt' },
  SECURITY: { key: 'security', label: 'Security & Visitor', icon: 'Shield' },
  STAFF: { key: 'staff', label: 'Staff & Vendor', icon: 'Briefcase' },
  COMMUNICATION: { key: 'communication', label: 'Communication', icon: 'MessageSquare' },
  COMPLAINTS: { key: 'complaints', label: 'Complaints', icon: 'AlertCircle' },
  FACILITIES: { key: 'facilities', label: 'Facility & Asset', icon: 'Home' },
  PARKING: { key: 'parking', label: 'Parking & Move', icon: 'ParkingCircle' },
};

// Map sidebar groups to permission keys
export const SIDEBAR_PERMISSION_MAP = {
  'Dashboard': 'dashboard',
  'Resident & Society': 'residents',
  'Billing & Finance': 'billing',
  'Security & Visitor': 'security',
  'Staff & Vendor': 'staff',
  'Communication': 'communication',
  'Complaints': 'complaints',
  'Facility & Asset': 'facilities',
  'Parking & Move': 'parking',
};

// Check if user has access to a module
export function hasPermission(permissions, moduleKey) {
  if (!permissions || !Array.isArray(permissions)) return false;
  if (permissions.includes('FULL_ACCESS')) return true;
  return permissions.includes(moduleKey);
}

// Get all permission keys as array
export function getAllPermissionKeys() {
  return Object.values(PERMISSION_MODULES).map(m => m.key);
}
