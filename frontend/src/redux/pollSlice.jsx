import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    question: null,
    options: [], // Array of options
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
            // Use console.log to debug the incoming payload
            console.log("setPoll reducer received:", action.payload);
            
            // Make sure to explicitly handle all properties with proper fallbacks
            state.question = action.payload.question || null;
            
            // Ensure options is always an array even if undefined in payload
            state.options = Array.isArray(action.payload.options) ? [...action.payload.options] : [];
            console.log("Options set in reducer:", state.options);
            
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