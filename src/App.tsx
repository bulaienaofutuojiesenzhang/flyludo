import React from "react";
import { NativeBaseProvider } from "native-base";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/ConfigStore';
import Roots from './Root';
import { AppDialogHost } from './component/AppDialog';

export default function App() {
  return (
    <NativeBaseProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Roots />
          <AppDialogHost />
        </PersistGate>
      </Provider>
    </NativeBaseProvider>
  );
}