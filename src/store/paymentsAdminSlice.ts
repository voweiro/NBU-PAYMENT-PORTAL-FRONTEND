import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type PaymentStatus = "successful" | "pending" | "failed";

export type AdminPayment = {
  payment_id: number;
  fee_id: number;
  amount_paid: number;
  transaction_ref: string;
  original_reference?: string | null;
  status: PaymentStatus;
  payment_date: string;
  receipt_drive_url?: string | null;
  student_email: string;
  student_name?: string | null;
  jamb_number?: string | null;
  matric_number?: string | null;
  level?: string | null;
  fee?: { fee_category: string; program?: { program_name: string; program_type: string } };
};

export const fetchPayments = createAsyncThunk<AdminPayment[], void, { state: RootState }>(
  "paymentsAdmin/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/payments`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to load payments");
      }
      return json.data as AdminPayment[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const getReceiptLink = createAsyncThunk<{ id: number; receiptUrl: string | null }, number, { state: RootState }>(
  "paymentsAdmin/getReceiptLink",
  async (payment_id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/receipts/${payment_id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to fetch receipt link");
      }
      return json.data as { id: number; receiptUrl: string | null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const generateReceipt = createAsyncThunk<{ id: number; receiptUrl: string | null }, number, { state: RootState }>(
  "paymentsAdmin/generateReceipt",
  async (payment_id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/receipts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: payment_id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to generate receipt");
      }
      return json.data as { id: number; receiptUrl: string | null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

type PaymentsAdminState = {
  items: AdminPayment[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: PaymentsAdminState = {
  items: [],
  status: "idle",
};

const paymentsAdminSlice = createSlice({
  name: "paymentsAdmin",
  initialState,
  reducers: {
    setPayments(state, action: PayloadAction<AdminPayment[]>) {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load payments";
      })
      .addCase(getReceiptLink.fulfilled, (state, action) => {
        const { id, receiptUrl } = action.payload;
        const idx = state.items.findIndex((p) => p.payment_id === id);
        if (idx >= 0) state.items[idx].receipt_drive_url = receiptUrl ?? undefined;
      })
      .addCase(generateReceipt.fulfilled, (state, action) => {
        const { id, receiptUrl } = action.payload;
        const idx = state.items.findIndex((p) => p.payment_id === id);
        if (idx >= 0) state.items[idx].receipt_drive_url = receiptUrl ?? undefined;
      });
  },
});

export const { setPayments } = paymentsAdminSlice.actions;
export default paymentsAdminSlice.reducer;