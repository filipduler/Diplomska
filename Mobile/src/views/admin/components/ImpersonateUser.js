import React, { useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import SearchableDropDown from 'react-native-searchable-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import Requests from 'mobile/src/services/requests';
import Auth from 'mobile/src/services/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const getName = user => `${user.name} (${user.email})`;

const ImpersonateUser = () => {
    const [userOptions, setUserOptions] = useState([]);
    const [state, setState] = useState({
        loading: true
    });

    useFocusEffect(
        React.useCallback(() => {
            loadState();
        }, [])
    )

    const loadState = async () => {
        if (Auth.userInfo.isImpersonating) {
            await loadImpersonatedView();
        } else {
            await loadNormalView();
        }
    }

    const loadImpersonatedView = async () => {
        const response = await Requests.getUsers();
        if (response.ok) {
            const user = response.payload.find(x => x.userId === Auth.userInfo.impersonatedUserId)
            if (user) {
                setState(state => ({
                    ...state,
                    loading: false,
                    isImpersonating: true,
                    name: getName(user)
                }));
            } else {
                throw 'failed finding impersonated user'
            }
        }
    }

    const loadNormalView = async () => {
        const response = await Requests.getUsers();
        if (response.ok) {
            const items = response.payload.map(user => {
                return {
                    id: user.userId,
                    name: getName(user)
                }
            });

            setUserOptions(items);

            setState(state => ({
                ...state,
                loading: false,
                isImpersonating: false
            }));
        }
    }

    const impersonateUser = async (user) => {
        const response = await Requests.postImpersonate(user.id);
        if (response.ok) {
            await Auth.refreshUserInfo();
            loadImpersonatedView();
        }
    }

    const stopImpersonating = async () => {
        const response = await Requests.postClearImpersonation();
        if (response.ok) {
            await Auth.refreshUserInfo();
            loadNormalView();
        }
    }

    return (
        <View>
            {state.loading
                ? <ActivityIndicator />
                : (state.isImpersonating
                    ? (<View style={styles.statusRow}>
                        <Text style={styles.statusText}>{state.name}</Text>
                        <Icon style={styles.statusCancelIcon} name="times-circle" size={21} onPress={stopImpersonating} />
                    </View>)
                    : <SearchableDropDown
                        onItemSelect={impersonateUser}
                        containerStyle={styles.containerStyle}
                        textInputStyle={styles.textInputStyle}
                        itemStyle={styles.itemStyle}
                        itemTextStyle={styles.itemTextStyle}
                        itemsContainerStyle={styles.itemsContainerStyle}
                        items={userOptions}
                        placeholder="Search for name or email.."
                        resetValue={false}
                        underlineColorAndroid="transparent"
                        //there seems to be a bug, this fixes it
                        textInputProps={{ onTextChange: _ => { } }}
                    />
                )}
        </View>
    );
};

var styles = StyleSheet.create({
    statusRow: {
        flexDirection:'row',
        padding: 20
    },
    statusText:{
        fontSize: 18, 
        fontWeight: '500'
    },
    statusCancelIcon: {
        marginLeft: 10, 
        alignSelf: 'center'
    },
    containerStyle: {
        padding: 5
    },
    textInputStyle: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#FAF7F6',
    },
    itemStyle: {
        padding: 10,
        marginTop: 2,
        backgroundColor: '#FFFFFF',
        borderColor: '#bbb',
        borderWidth: 1,
    },
    itemTextStyle: {
        color: '#222',
    },
    itemsContainerStyle: {
        maxHeight: '60%',
    }
})

export default ImpersonateUser;