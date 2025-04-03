import { configureStore } from "@reduxjs/toolkit";
import pollReducer from "./pollSlice";

const store = configureStore({
    reducer: {
        poll: pollReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable for socket.io objects if needed
        }),
});

export default store;