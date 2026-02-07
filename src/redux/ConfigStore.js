import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Reducer
import GlobalReducer from './GlobalReducer.js';
import UserReducer from './UserReducer';
import GameReducer from './GameReducer';

const RootReducer = combineReducers ({
    global: GlobalReducer,
    user: UserReducer,
    game: GameReducer,
});

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};


// 持久化 Reducer
const persistedReducer = persistReducer(persistConfig, RootReducer);

// 配置 Store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ 
        serializableCheck: {
          ignoredActions: ['persist/PURGE', 'persist/REHYDRATE', 'persist/FLUSH', 'persist/REMOVE','persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });

// 持久化 Store
// export const persistor = persistStore(store);
export const persistor = persistStore(store);