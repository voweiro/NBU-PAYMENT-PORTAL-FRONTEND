import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type Admin = {
  admin_id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  created_at?: string;
};

export const fetchAdmins = createAsyncThunk<Admin[], void, { state: RootState }>(
  "admins/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/admins`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to load admins");
      }
      return json.data as Admin[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const createAdmin = createAsyncThunk<Admin, { name: string; email: string; password: string; role: Admin["role"] }, { state: RootState }>(
  "admins/create",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to create admin");
      }
      return json.data as Admin;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const updateAdmin = createAsyncThunk<Admin, { admin_id: number; name?: string; role?: Admin["role"]; password?: string }, { state: RootState }>(
  "admins/update",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const { admin_id, ...data } = payload;
      const res = await fetch(`${API_URL}/admins/${admin_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to update admin");
      }
      return json.data as Admin;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const deleteAdmin = createAsyncThunk<number, number, { state: RootState }>(
  "admins/delete",
  async (admin_id, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/admins/${admin_id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to delete admin");
      }
      return admin_id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

type AdminsState = {
  items: Admin[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: boolean;
  error?: string;
};

const initialState: AdminsState = {
  items: [],
  status: "idle",
  saving: false,
};

const adminsSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {
    upsertAdmin(state, action: PayloadAction<Admin>) {
      const idx = state.items.findIndex((a) => a.admin_id === action.payload.admin_id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.unshift(action.payload);
    },
    removeAdmin(state, action: PayloadAction<number>) {
      state.items = state.items.filter((a) => a.admin_id !== action.payload);
    },
    clearAdmins(state) {
      state.items = [];
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load admins";
      })
      .addCase(createAdmin.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to create admin";
      })
      .addCase(updateAdmin.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        const idx = state.items.findIndex((a) => a.admin_id === updated.admin_id);
        if (idx >= 0) state.items[idx] = updated;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to update admin";
      })
      .addCase(deleteAdmin.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload as number;
        state.items = state.items.filter((a) => a.admin_id !== id);
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to delete admin";
      });
  },
});

export const { upsertAdmin, removeAdmin, clearAdmins } = adminsSlice.actions;
export default adminsSlice.reducer;