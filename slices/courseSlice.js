import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    return data;
});

const coursesSlice = createSlice({
    name: 'courses',
    initialState: {
        courses: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.courses = action.payload;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default coursesSlice.reducer;
