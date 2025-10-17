import { createSlice } from "@reduxjs/toolkit";

type UiState = {
  count: number;
  sidebarOpen: boolean;
};

const initialState: UiState = { 
  count: 0, 
  sidebarOpen: true 
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    increment(state) {
      state.count += 1;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload as boolean;
    },
  },
});

export const { increment, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;