import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import uiReducer from "./uiSlice";
import authReducer from "./authSlice";
import paymentReducer from "./paymentSlice";
import programsReducer from "./programsSlice";
import feesReducer from "./feesSlice";
import dashboardReducer from "./dashboardSlice";
import adminsReducer from "./adminsSlice";
import paymentsAdminReducer from "./paymentsAdminSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    payment: paymentReducer,
    programs: programsReducer,
    fees: feesReducer,
    dashboard: dashboardReducer,
    admins: adminsReducer,
    paymentsAdmin: paymentsAdminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;