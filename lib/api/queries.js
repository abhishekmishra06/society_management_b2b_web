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
