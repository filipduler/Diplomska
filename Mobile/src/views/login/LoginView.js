import React, { useState } from 'react';
import { Button, TextInput } from 'react-native';
import Requests from 'mobile/src/services/requests';
import Store from '../../services/store';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginView = ({ navigation }) => {
    const { setLoggedInStatus } = React.useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = async () => {
        const response = await Requests.postLogin({
            email, password
        });
        console.log(response);
        if(response && response.ok) {
            await Store.auth.setJWTAsync(response.payload.token.token);
            Store.auth.isLogged = true;
            setLoggedInStatus(true);
        }
    }

    return (
        <SafeAreaView>
            <TextInput 
                placeholder='Email' 
                keyboardType='email-address' 
                value={email} 
                autoCapitalize={false}
                onChangeText={(x) => setEmail(x)} />
            <TextInput 
                placeholder='Password' 
                secureTextEntry={true} 
                value={password} 
                autoCapitalize={false}
                onChangeText={(x) => setPassword(x)} />
            <Button title='Login' onPress={login} />
        </SafeAreaView>
    );
};

export default LoginView;