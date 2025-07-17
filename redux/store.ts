import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice'

const store = configureStore({
    reducer: {
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: {
            // Ignore state paths, e.g. state for 'items':
            ignoredPaths: ['items.data']
        },
        serializableCheck: { ignoredPaths: ['some.nested.path'] }
    })
});

export default store;
