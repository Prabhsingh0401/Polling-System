import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    question: null,
    options: [], // Added options array explicitly
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
            // Make sure to explicitly handle all properties
            state.question = action.payload.question || null;
            state.options = action.payload.options || [];
            state.responses = action.payload.responses || {};
            state.type = action.payload.type || null;
            state.duration = action.payload.duration || null;
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
            state.options = [];
            state.responses = {};
            state.error = null;
        }
    },
});

export const { setPoll, setStats, setError, setLoading, resetPoll } = pollSlice.actions;
export default pollSlice.reducer;