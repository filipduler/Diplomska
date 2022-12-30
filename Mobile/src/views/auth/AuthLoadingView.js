import React from 'react';
import { ActivityIndicator, StatusBar } from 'react-native';
import Store from 'mobile/src/services/store';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from 'mobile/App.js';
import { useFocusEffect } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';

const AuthLoadingView = () => {
    const { onLogIn, onLogOut } = React.useContext(AuthContext);

    useFocusEffect(
        React.useCallback(() => {
            
            const loadAuthData = async () => {
                const jwt = await Store.auth.getJWTAsync();
                if(jwt && jwt.length > 0) {
                    await onLogIn(jwt);
                } else {
                    onLogOut();
                }
            }

            loadAuthData();
        }, [])
    )
    return (
        <LoadingView loading={true}/>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default AuthLoadingView;