import React from "react";
import { NativeBaseProvider } from "native-base";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './redux/ConfigStore';
import Roots from './Root';
import { AppDialogHost } from './component/AppDialog';
import { GreetBootstrap } from './providers/GreetBootstrap';

export default function App() {
  return (
    <SafeAreaProvider>
      <NativeBaseProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Roots />
            <AppDialogHost />
            <GreetBootstrap />
          </PersistGate>
        </Provider>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
}