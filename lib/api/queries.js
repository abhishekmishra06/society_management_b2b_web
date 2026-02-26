'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

// Query Keys
export const QUERY_KEYS = {
  USER_PROFILE: ['user', 'profile'],
  USER_PERMISSIONS: ['user', 'permissions'],
  RESIDENTS: ['residents'],
  RESIDENT: (id) => ['resident', id],
  OWNERS: ['owners'],
  TENANTS: ['tenants'],
  TOWERS: ['towers'],
  FLATS: ['flats'],
  VEHICLES: ['vehicles'],
  KYC_REQUESTS: ['kyc'],
  EMERGENCIES: ['emergencies'],
  MAINTENANCE_BILLS: ['maintenanceBills'],
  UTILITY_BILLS: ['utilityBills'],
  PAYMENTS: ['payments'],
  EXPENSES: ['expenses'],
  LEDGER: ['ledger'],
  VISITORS: ['visitors'],
  GATE_PASSES: ['gatePasses'],
  BLACKLIST: ['blacklist'],
  STAFF: ['staff'],
  STAFF_ATTENDANCE: ['staffAttendance'],
  STAFF_SALARY: ['staffSalary'],
  VENDORS: ['vendors'],
  VENDOR_CONTRACTS: ['vendorContracts'],
  VENDOR_PAYMENTS: ['vendorPayments'],
  NOTICES: ['notices'],
  ANNOUNCEMENTS: ['announcements'],
  COMPLAINTS: ['complaints'],
  FACILITIES: ['facilities'],
  FACILITY_BOOKINGS: ['facilityBookings'],
  ASSETS: ['assets'],
  AMC: ['amc'],
  PARKING: ['parking'],
  MOVE_REQUESTS: ['moveRequests'],
  DOCUMENTS: ['documents'],
};

// User Queries
export const useUserProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_USER_PROFILE);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserPermissions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PERMISSIONS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_USER_PERMISSIONS);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Resident Queries
export const useResidents = () => {
  return useQuery({
    queryKey: QUERY_KEYS.RESIDENTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_RESIDENTS);
      return data;
    },
  });
};

export const useResident = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.RESIDENT(id),
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_RESIDENT(id));
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateResident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (residentData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_RESIDENT, residentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESIDENTS });
    },
  });
};

export const useUpdateResident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(API_ENDPOINTS.UPDATE_RESIDENT(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESIDENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESIDENT(variables.id) });
    },
  });
};

export const useDeleteResident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(API_ENDPOINTS.DELETE_RESIDENT(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESIDENTS });
    },
  });
};

// Owner Queries
export const useOwners = () => {
  return useQuery({
    queryKey: QUERY_KEYS.OWNERS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_OWNERS);
      return data;
    },
  });
};

// Tenant Queries
export const useTenants = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TENANTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_TENANTS);
      return data;
    },
  });
};

// Tower Queries
export const useTowers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TOWERS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_TOWERS);
      return data;
    },
  });
};

export const useCreateTower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (towerData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_TOWER, towerData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOWERS });
    },
  });
};

// Flat Queries
export const useFlats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.FLATS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_FLATS);
      return data;
    },
  });
};

export const useCreateFlat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flatData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_FLAT, flatData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLATS });
    },
  });
};

// Vehicle Queries
export const useVehicles = () => {
  return useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_VEHICLES);
      return data;
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_VEHICLE, vehicleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES });
    },
  });
};

// KYC Queries
export const useKYCRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.KYC_REQUESTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_KYC_REQUESTS);
      return data;
    },
  });
};

export const useApproveKYC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remarks }) => {
      const { data } = await apiClient.post(API_ENDPOINTS.APPROVE_KYC(id), { remarks });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KYC_REQUESTS });
    },
  });
};

// Emergency Queries
export const useActiveEmergencies = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EMERGENCIES,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_ACTIVE_EMERGENCIES);
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useTriggerEmergency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (emergencyData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.TRIGGER_EMERGENCY, emergencyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMERGENCIES });
    },
  });
};


// ===== BILLING QUERIES =====
export const useMaintenanceBills = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MAINTENANCE_BILLS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_MAINTENANCE_BILLS);
      return data;
    },
  });
};

export const useCreateMaintenanceBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_MAINTENANCE_BILL, billData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE_BILLS });
    },
  });
};

export const useUtilityBills = () => {
  return useQuery({
    queryKey: QUERY_KEYS.UTILITY_BILLS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_UTILITY_BILLS);
      return data;
    },
  });
};

export const usePayments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_PAYMENTS);
      return data;
    },
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_PAYMENT, paymentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE_BILLS });
    },
  });
};

export const useExpenses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EXPENSES,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_EXPENSES);
      return data;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_EXPENSE, expenseData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
    },
  });
};

export const useLedger = () => {
  return useQuery({
    queryKey: QUERY_KEYS.LEDGER,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_LEDGER);
      return data;
    },
  });
};

// ===== VISITOR QUERIES =====
export const useVisitors = () => {
  return useQuery({
    queryKey: QUERY_KEYS.VISITORS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_VISITORS);
      return data;
    },
  });
};

export const useCreateVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitorData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_VISITOR, visitorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITORS });
    },
  });
};

export const useGatePasses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.GATE_PASSES,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_GATE_PASSES);
      return data;
    },
  });
};

export const useCreateGatePass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (passData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_GATE_PASS, passData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GATE_PASSES });
    },
  });
};

export const useBlacklist = () => {
  return useQuery({
    queryKey: QUERY_KEYS.BLACKLIST,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_BLACKLIST);
      return data;
    },
  });
};

// ===== STAFF QUERIES =====
export const useStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_STAFF);
      return data;
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_STAFF, staffData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
    },
  });
};

export const useStaffAttendance = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF_ATTENDANCE,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_STAFF_ATTENDANCE);
      return data;
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attendanceData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.MARK_ATTENDANCE, attendanceData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF_ATTENDANCE });
    },
  });
};

export const useStaffSalary = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF_SALARY,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_STAFF_SALARY);
      return data;
    },
  });
};

// ===== VENDOR QUERIES =====
export const useVendors = () => {
  return useQuery({
    queryKey: QUERY_KEYS.VENDORS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_VENDORS);
      return data;
    },
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vendorData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_VENDOR, vendorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VENDORS });
    },
  });
};

export const useVendorContracts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.VENDOR_CONTRACTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_VENDOR_CONTRACTS);
      return data;
    },
  });
};

export const useCreateVendorContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contractData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_CONTRACT, contractData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VENDOR_CONTRACTS });
    },
  });
};

export const useVendorPayments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.VENDOR_PAYMENTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_VENDOR_PAYMENTS);
      return data;
    },
  });
};

export const useCreateVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_VENDOR_PAYMENT, paymentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VENDOR_PAYMENTS });
    },
  });
};

// ===== COMMUNICATION QUERIES =====
export const useNotices = () => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTICES,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_NOTICES);
      return data;
    },
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noticeData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_NOTICE, noticeData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTICES });
    },
  });
};

export const useAnnouncements = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_ANNOUNCEMENTS);
      return data;
    },
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (announcementData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_ANNOUNCEMENT, announcementData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS });
    },
  });
};

// ===== COMPLAINT QUERIES =====
export const useComplaints = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPLAINTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_COMPLAINTS);
      return data;
    },
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (complaintData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_COMPLAINT, complaintData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLAINTS });
    },
  });
};

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(API_ENDPOINTS.UPDATE_COMPLAINT(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLAINTS });
    },
  });
};

// ===== FACILITY QUERIES =====
export const useFacilities = () => {
  return useQuery({
    queryKey: QUERY_KEYS.FACILITIES,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_FACILITIES);
      return data;
    },
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (facilityData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_FACILITY, facilityData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FACILITIES });
    },
  });
};

export const useFacilityBookings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.FACILITY_BOOKINGS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_FACILITY_BOOKINGS);
      return data;
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_BOOKING, bookingData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FACILITY_BOOKINGS });
    },
  });
};

export const useAssets = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ASSETS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_ASSETS);
      return data;
    },
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assetData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_ASSET, assetData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
    },
  });
};

export const useAMC = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AMC,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_AMC);
      return data;
    },
  });
};

// ===== PARKING QUERIES =====
export const useParking = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PARKING,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_PARKING);
      return data;
    },
  });
};

export const useCreateParkingSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slotData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_PARKING_SLOT, slotData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARKING });
    },
  });
};

export const useMoveRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MOVE_REQUESTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_MOVE_REQUESTS);
      return data;
    },
  });
};

export const useCreateMoveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (moveData) => {
      const { data } = await apiClient.post(API_ENDPOINTS.CREATE_MOVE_REQUEST, moveData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MOVE_REQUESTS });
    },
  });
};

export const useDocuments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_DOCUMENTS);
      return data;
    },
  });
};
