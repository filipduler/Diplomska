import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import SearchableDropDown from 'react-native-searchable-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import Requests from 'mobile/src/services/requests';
import Auth from 'mobile/src/services/auth';
import Icon from 'react-native-vector-icons/AntDesign';

const ImpersonateUser = () => {
    const [userOptions, setUserOptions] = useState([]);
    const [state, setState] = useState({
        loading: true
    });

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus AdminView');
            loadState();


            return () => {
                //on unfocus
                console.log('unfocus AdminView');
            };
        }, [])
    )

    const loadState = async () => {
        console.log(Auth);
        if (Auth.userInfo.isImpersonating) {
            loadImpersonatedView();
        } else {
            loadNormalView();
        }
    }

    const loadImpersonatedView = async () => {
        const response = await Requests.getUsers();
        if (response && response.ok) {
            const user = response.payload.find(x => x.userId === Auth.userInfo.userId)
            if (user) {
                setState(state => ({
                    ...state,
                    loading: false,
                    isImpersonating: true,
                    name: `${user.name} (${user.email})`
                }));
            }
        }
    }

    const loadNormalView = async () => {
        const response = await Requests.getUsers();
        if (response && response.ok) {
            console.log(response);
            const items = response.payload.map(x => {
                return {
                    id: x.userId,
                    name: `${x.name} (${x.email})`
                }
            });
            console.log(items);
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
        if(response && response.ok) {
            await Auth.refreshUserInfo();
            loadImpersonatedView();
        }
    }

    const stopImpersonating = async () => {
        const response = await Requests.postClearImpersonation();
        if(response && response.ok) {
            await Auth.refreshUserInfo();
            loadNormalView();
        }
    }

    return (
        <View>
            {state.loading
                ? <ActivityIndicator />
                : (state.isImpersonating
                    ? (<>
                    <Text>{state.name}</Text>
                    <Icon name="close" size={21} onPress={stopImpersonating} />
                    </>)
                    : <SearchableDropDown
                        onItemSelect={impersonateUser}
                        //onItemSelect called after the selection from the dropdown
                        containerStyle={{ padding: 5 }}
                        //suggestion container style
                        textInputStyle={{
                            //inserted text style
                            padding: 12,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6',
                        }}
                        itemStyle={{
                            //single dropdown item style
                            padding: 10,
                            marginTop: 2,
                            backgroundColor: '#FAF9F8',
                            borderColor: '#bbb',
                            borderWidth: 1,
                        }}
                        itemTextStyle={{
                            //text style of a single dropdown item
                            color: '#222',
                        }}
                        itemsContainerStyle={{
                            //items container style you can pass maxHeight
                            //to restrict the items dropdown hieght
                            maxHeight: '60%',
                        }}
                        items={userOptions}
                        placeholder="Search for name or email.."
                        //place holder for the search input
                        resetValue={false}
                        //reset textInput Value with true and false state
                        underlineColorAndroid="transparent"
                    //To remove the underline from the android input
                    />
                )}
        </View>
    );
};

export default ImpersonateUser;