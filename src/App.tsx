import React from "react";
import { SafeAreaView, Dimensions } from 'react-native';
import { NativeBaseProvider, Box } from "native-base";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/ConfigStore';
import Roots from './Root';

// persistor.flush().then(() => {
//   persistor.purge();
// });  

export default function App() {
  return (
    <NativeBaseProvider>
      <NativeBaseProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <Roots />
            </PersistGate>
          </Provider>
        </NativeBaseProvider>
    </NativeBaseProvider>
  );
}