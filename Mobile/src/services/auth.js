import Store from 'mobile/src/services/store';
import Requests from 'mobile/src/services/requests';

const Auth = {
    loggedIn: false,
    userInfo: null,
    refreshUserInfo: async () => {
        const jwt = await Store.auth.getJWTAsync();
        if(jwt){
            const response = await Requests.getUserInfo();
            if (response && response.ok) {
                Auth.userInfo = response.payload;
            }
        }
    }
}

export default Auth;