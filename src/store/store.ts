import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tournamentReducer from './slices/tournamentSlice';
import teamReducer from './slices/teamSlice';
import registrationReducer from './slices/registrationSlice';
import categoryReducer from './slices/categorySlice';
import matchReducer from './slices/matchSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tournament: tournamentReducer,
        team: teamReducer,
        registration: registrationReducer,
        category: categoryReducer,
        match: matchReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
