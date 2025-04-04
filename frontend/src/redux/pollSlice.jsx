import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  question: '',
  options: [],
  duration: 0,
  responses: {}
};

export const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setPoll: (state, action) => {
      return {
        ...state,
        ...action.payload,
        options: action.payload.options || []
      };
    },
    resetPoll: () => initialState,
  },
});

export const { setPoll, resetPoll } = pollSlice.actions;

export default pollSlice.reducer;