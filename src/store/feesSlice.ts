import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type Fee = {
  fee_id: number;
  program_id: number;
  fee_category: string;
  amount: string | number; // Prisma Decimal serialized; treat as string or number
  session?: string | null;
  semester?: string | null;
  levels?: Level[] | null;
};

export type Level = "L100" | "L200" | "L300" | "L400" | "L500" | "L600" | "ALL";

export const fetchFeesByProgram = createAsyncThunk(
  "fees/fetchByProgram",
  async (programId: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/fees/program/${programId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to load fees");
      }
      return json.data as Fee[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const fetchFees = createAsyncThunk(
  "fees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/fees`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to load fees");
      }
      return json.data as Fee[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const createFee = createAsyncThunk(
  "fees/create",
  async (
    payload: {
      program_id: number;
      fee_category: string;
      amount: number;
      session?: string | null;
      semester?: string | null;
      levels?: Level[] | null;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/fees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...payload,
          program_id: String(payload.program_id),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to create fee");
      }
      return json.data as Fee;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const updateFee = createAsyncThunk(
  "fees/update",
  async (
    payload: {
      fee_id: number;
      fee_category: string;
      amount: number;
      session?: string | null;
      semester?: string | null;
      levels?: Level[] | null;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const { fee_id, ...data } = payload;
      const res = await fetch(`${API_URL}/fees/${fee_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to update fee");
      }
      return json.data as Fee;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const deleteFee = createAsyncThunk(
  "fees/delete",
  async (fee_id: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/fees/${fee_id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to delete fee");
      }
      return fee_id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

type FeesState = {
  items: Fee[];
  selectedProgramId?: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  saving: boolean;
};

const initialState: FeesState = {
  items: [],
  status: "idle",
  saving: false,
};

const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    upsertFee(state, action: PayloadAction<Fee>) {
      const idx = state.items.findIndex((f) => f.fee_id === action.payload.fee_id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.unshift(action.payload);
    },
    removeFee(state, action: PayloadAction<number>) {
      state.items = state.items.filter((f) => f.fee_id !== action.payload);
    },
    setSelectedProgramId(state, action: PayloadAction<number | undefined>) {
      state.selectedProgramId = action.payload;
    },
    clearFees(state) {
      state.items = [];
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFees.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchFees.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load fees";
      })
      .addCase(fetchFeesByProgram.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchFeesByProgram.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchFeesByProgram.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load fees";
      })
      .addCase(createFee.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(createFee.fulfilled, (state, action) => {
        state.saving = false;
        const created = action.payload;
        state.items.unshift(created);
      })
      .addCase(createFee.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to create fee";
      })
      .addCase(updateFee.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(updateFee.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        const idx = state.items.findIndex((f) => f.fee_id === updated.fee_id);
        if (idx >= 0) state.items[idx] = updated;
      })
      .addCase(updateFee.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to update fee";
      })
      .addCase(deleteFee.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(deleteFee.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload as number;
        state.items = state.items.filter((f) => f.fee_id !== id);
      })
      .addCase(deleteFee.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to delete fee";
      });
  },
});

export const { upsertFee, removeFee, setSelectedProgramId, clearFees } = feesSlice.actions;
export default feesSlice.reducer;