import {configureStore} from '@reduxjs/toolkit';
import { api } from './api/queries';

export function makeStore() {
    return configureStore({
        reducer: {
            [api.reducerPath]: api.reducer
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    })
}