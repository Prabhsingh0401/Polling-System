import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    question: null,
    responses: {},
    stats: {
        connectedStudents: 0,
        connectedTeachers: 0,
        responseCount: 0
    },
    error: null,
    loading: false
};

const pollSlice = createSlice({
    name: "poll",
    initialState,
    reducers: {
        setPoll: (state, action) => {
            state.question = action.payload.question || null;
            state.responses = action.payload.responses || {};
        },
        setStats: (state, action) => {
            state.stats = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        resetPoll: (state) => {
            state.question = null;
            state.responses = {};
            state.error = null;
        }
    },
});

export const { setPoll, setStats, setError, setLoading, resetPoll } = pollSlice.actions;
export default pollSlice.reducer;