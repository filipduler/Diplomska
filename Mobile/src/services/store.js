import AsyncStorage from '@react-native-async-storage/async-storage';

const JWT_STORE_KEY = 'jwt_token';
const TIMER_STORE_KEY = 'timer'

const Store = {
    currentDate: {
        cursor: new Date(),
        get month() {
            return this.cursor.getMonth();
        },
        get year() {
            return this.cursor.getFullYear();
        },
        moveCursor: function(month) {
            this.cursor = new Date(this.cursor.setMonth(this.cursor.getMonth() + month));
        }
    },
    auth: {
        getJWTAsync: async function() {
            return await AsyncStorage.getItem(JWT_STORE_KEY);

        },
        setJWTAsync: async function(jwt) {
            await AsyncStorage.setItem(JWT_STORE_KEY, jwt);
        },
        removeJWTAsync: async function(jwt) {
            await AsyncStorage.removeItem(JWT_STORE_KEY);
        }
    },
    timer: {
        getTimerAsync: async function() {
            const timer = await AsyncStorage.getItem(TIMER_STORE_KEY);
            return timer ? JSON.parse(timer) : null;
        },
        setTimerAsync: async function(timerObject) {
            if(timerObject){
                await AsyncStorage.setItem(TIMER_STORE_KEY, JSON.stringify(timerObject));
            }
        },
        removeTimerAsync: async function() {
            await AsyncStorage.removeItem(TIMER_STORE_KEY);
        }
    }
}

export default Store;