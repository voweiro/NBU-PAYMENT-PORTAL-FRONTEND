import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const initiatePayment = createAsyncThunk(
  "payment/initiate",
  async (
    payload: {
      feeId?: number;
      feeIds?: number[];
      studentEmail: string;
      studentName?: string;
      gateway?: "paystack" | "flutterwave" | "global";
      jambNumber?: string;
      matricNumber?: string;
      level?: Level;
      percent?: 25 | 50 | 75 | 100;
      phoneNumber?: string;
      address?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_URL}/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          feeId: payload.feeId !== undefined ? String(payload.feeId) : undefined,
          feeIds: Array.isArray(payload.feeIds) ? payload.feeIds.map((id) => String(id)) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const detailMsg = Array.isArray(json?.details)
          ? json.details.map((d: { message?: string }) => d?.message).filter(Boolean).join("; ")
          : undefined;
        const msg = (detailMsg && detailMsg.length > 0)
          ? detailMsg
          : (typeof json.error === "string" ? json.error : "Initiation failed");
        return rejectWithValue(msg);
      }
      return json.data as {
        reference: string;
        paymentId: number;
        gateway: "paystack" | "flutterwave" | "global";
        authorization_url?: string; // paystack
        link?: string; // flutterwave or global
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (
    { reference, gateway, originalRef }: { reference: string; gateway: "paystack" | "flutterwave" | "global"; originalRef?: string },
    { rejectWithValue }
  ) => {
    try {
      const q = new URLSearchParams({ gateway });
      if (originalRef) q.set("original_reference", originalRef);
      const url = `${API_URL}/payments/verify/${encodeURIComponent(reference)}?${q.toString()}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = typeof json.error === "string" ? json.error : "Verification failed";
        return rejectWithValue(msg);
      }
      return json.data as { reference: string; status: "successful" | "failed" | "pending"; paymentId?: number };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

type PaymentState = {
  selectedProgramId?: number;
  selectedFeeId?: number; // legacy single selection
  selectedFeeIds?: number[]; // new multi-selection
  studentEmail?: string;
  studentName?: string;
  gateway: "paystack" | "flutterwave" | "global";
  jambNumber?: string;
  matricNumber?: string;
  initStatus: "idle" | "loading" | "succeeded" | "failed";
  verifyStatus: "idle" | "loading" | "succeeded" | "failed";
  reference?: string;
  payUrl?: string;
  error?: string;
};

const initialState: PaymentState = {
  gateway: "global",
  initStatus: "idle",
  verifyStatus: "idle",
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setProgramId(state, action: PayloadAction<number | undefined>) {
      state.selectedProgramId = action.payload;
    },
    setFeeId(state, action: PayloadAction<number | undefined>) {
      state.selectedFeeId = action.payload;
    },
    setFeeIds(state, action: PayloadAction<number[] | undefined>) {
      state.selectedFeeIds = action.payload ?? [];
    },
    setStudentInfo(
      state,
      action: PayloadAction<{ email?: string; name?: string }>
    ) {
      state.studentEmail = action.payload.email;
      state.studentName = action.payload.name;
    },
    setGateway(state, action: PayloadAction<"paystack" | "flutterwave" | "global">) {
      state.gateway = action.payload;
    },
    setJambNumber(state, action: PayloadAction<string | undefined>) {
      state.jambNumber = action.payload;
    },
    setMatricNumber(state, action: PayloadAction<string | undefined>) {
      state.matricNumber = action.payload;
    },
    resetPayment(state) {
      state.initStatus = "idle";
      state.verifyStatus = "idle";
      state.reference = undefined;
      state.payUrl = undefined;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.initStatus = "loading";
        state.error = undefined;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.initStatus = "succeeded";
        state.reference = action.payload.reference;
        const { authorization_url, link } = action.payload;
        state.payUrl = authorization_url ?? link;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.initStatus = "failed";
        state.error = typeof action.payload === "string" ? action.payload : "Initiation failed";
      })
      .addCase(verifyPayment.pending, (state) => {
        state.verifyStatus = "loading";
        state.error = undefined;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.verifyStatus = "succeeded";
        // keep status if needed; for now rely on returned data
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifyStatus = "failed";
        state.error = typeof action.payload === "string" ? action.payload : "Verification failed";
      });
  },
});

export const {
  setProgramId,
  setFeeId,
  setStudentInfo,
  setGateway,
  setJambNumber,
  setMatricNumber,
  resetPayment,
} = paymentSlice.actions;
export default paymentSlice.reducer;
import type { Level } from "./feesSlice";