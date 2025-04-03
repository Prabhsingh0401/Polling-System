import { configureStore } from "@reduxjs/toolkit";
import pollReducer from "./pollSlice";

const store = configureStore({
    reducer: {
        poll: pollReducer,
    },
});

export default store;