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
        logged: false,
        get isLogged() {
            return this.logged;
        },
        set isLogged(value) {
            this.logged = value;
        },
        getJWTAsync: async function() {
            return await AsyncStorage.getItem(JWT_STORE_KEY);

        },
        setJWTAsync: async function(jwt) {
            await AsyncStorage.setItem(JWT_STORE_KEY, jwt);
        }
    },
    timer: {
        getTimerAsync: async function() {
            const timer = await AsyncStorage.getItem(TIMER_STORE_KEY);
            return timer ? JSON.parse(timer) : null;
        },
        setTimerAsync: async function(timerObject) {
            await AsyncStorage.setItem(TIMER_STORE_KEY, JSON.stringify(timerObject));
        }
    }
}

export default Store;