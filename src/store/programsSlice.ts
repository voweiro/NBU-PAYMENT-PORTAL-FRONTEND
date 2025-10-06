import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type Program = {
  program_id: number;
  program_name: string;
  program_type: "undergraduate" | "postgraduate" | "diploma" | "pre_degree";
};

export const fetchPrograms = createAsyncThunk(
  "programs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/programs`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to load programs");
      }
      return json.data as Program[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const createProgram = createAsyncThunk(
  "programs/create",
  async (
    { program_name, program_type }: { program_name: string; program_type: Program["program_type"] },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/programs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ program_name, program_type }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to create program");
      }
      return json.data as Program;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const updateProgram = createAsyncThunk(
  "programs/update",
  async (
    { program_id, program_name, program_type }: { program_id: number; program_name: string; program_type: Program["program_type"] },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/programs/${program_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ program_name, program_type }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to update program");
      }
      return json.data as Program;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const deleteProgram = createAsyncThunk(
  "programs/delete",
  async (program_id: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const res = await fetch(`${API_URL}/programs/${program_id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Failed to delete program");
      }
      return program_id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

type ProgramsState = {
  items: Program[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  saving: boolean;
};

const initialState: ProgramsState = {
  items: [],
  status: "idle",
  saving: false,
};

const programsSlice = createSlice({
  name: "programs",
  initialState,
  reducers: {
    upsertProgram(state, action: PayloadAction<Program>) {
      const idx = state.items.findIndex((p) => p.program_id === action.payload.program_id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.unshift(action.payload);
    },
    removeProgram(state, action: PayloadAction<number>) {
      state.items = state.items.filter((p) => p.program_id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrograms.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load programs";
      })
      .addCase(createProgram.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(createProgram.fulfilled, (state, action) => {
        state.saving = false;
        const created = action.payload;
        state.items.unshift(created);
      })
      .addCase(createProgram.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to create program";
      })
      .addCase(updateProgram.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(updateProgram.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p.program_id === updated.program_id);
        if (idx >= 0) state.items[idx] = updated;
      })
      .addCase(updateProgram.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to update program";
      })
      .addCase(deleteProgram.pending, (state) => {
        state.saving = true;
        state.error = undefined;
      })
      .addCase(deleteProgram.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload as number;
        state.items = state.items.filter((p) => p.program_id !== id);
      })
      .addCase(deleteProgram.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? "Failed to delete program";
      });
  },
});
export const { upsertProgram, removeProgram } = programsSlice.actions;
export default programsSlice.reducer;