"use client";

// store.js
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice'

export const store = configureStore({
    reducer: {
        courses: courseReducer,
    },
});

export default store;
