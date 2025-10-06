import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_URL}/admins/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return rejectWithValue(json.error ?? "Login failed");
      }
      return json.data as { token: string };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

type AuthState = {
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: AuthState = {
  token: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.status = "idle";
      state.error = undefined;
    },
    setToken(state, action: { payload: string }) {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;