import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface ChatState {
  chatHistory: ChatMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chatHistory: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addMessage, setLoading, setError } = chatSlice.actions;
export default chatSlice.reducer;
