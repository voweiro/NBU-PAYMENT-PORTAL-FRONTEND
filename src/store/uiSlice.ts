import { createSlice } from "@reduxjs/toolkit";

type UiState = {
  theme: "light" | "dark";
  count: number;
  sidebarOpen: boolean;
};

// Initialize theme from localStorage if available
const getInitialTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch {}
  }
  return "light";
};

const initialState: UiState = { 
  theme: getInitialTheme(), 
  count: 0, 
  sidebarOpen: true 
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
      // Persist theme to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("theme", state.theme);
        } catch {}
      }
    },
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

export const { toggleTheme, increment, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;