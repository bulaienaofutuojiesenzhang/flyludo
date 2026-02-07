import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
    async getItem(key){
        try {
			return await AsyncStorage.getItem(key);
		  } catch(e) {
			console.error('AsyncStorage getItem:', e)
		  }
    },
    async setItem(key, value){
        try {
			return await AsyncStorage.setItem(key, value)
		  } catch (e) {
			console.error('AsyncStorage setItem:', e)
		  }
    },
}