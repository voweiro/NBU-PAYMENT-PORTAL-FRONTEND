import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';

export interface DashboardStats {
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  revenueChange: number;
  paymentsChange: number;
  pendingChange: number;
}

export interface ChartData {
  label: string;
  value: number;
}

interface DashboardState {
  stats: DashboardStats;
  revenueChart: ChartData[];
  paymentsChart: ChartData[];
  programsChart: ChartData[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    revenueChange: 0,
    paymentsChange: 0,
    pendingChange: 0,
  },
  revenueChart: [],
  paymentsChart: [],
  programsChart: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk to fetch dashboard data from API
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const stateToken = state.auth.token;
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const token = stateToken ?? localToken;
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL!;
      const response = await fetch(`${API_URL}/dashboard/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.revenueChart = action.payload.revenueChart;
        state.paymentsChart = action.payload.paymentsChart;
        state.programsChart = action.payload.programsChart;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;