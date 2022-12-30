import React from 'react';
import Store from 'mobile/src/services/store';
import { AuthContext } from 'mobile/App.js';
import { useFocusEffect } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';

const AuthLoadingView = () => {
    const { onLogIn, onLogOut } = React.useContext(AuthContext);

    const loadAuthData = async () => {
        let ok = false;
        try{
            const jwt = await Store.auth.getJWTAsync();
            if(jwt && jwt.length > 0) {
                await onLogIn(jwt);
                ok = true;
            } 
        }
        catch(err) {
            console.error(err);
        }

        if(!ok) {
            onLogOut();
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            loadAuthData();

            return () => {};
        }, [])
    )
    return (
        <LoadingView loading={true}/>
    );
};

export default AuthLoadingView;