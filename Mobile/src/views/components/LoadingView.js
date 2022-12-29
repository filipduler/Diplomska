import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { StyleSheet } from 'react-native';

const LoadingView = ({ loading, children }) => {
    return (
        <>
            {
                loading
                    ? (<View style={styles.container}>
                        <ActivityIndicator />
                        <StatusBar barStyle='default' />
                    </View>)
                    : (children)
            }

        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default LoadingView;