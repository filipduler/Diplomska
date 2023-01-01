import React, { useState } from 'react';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Counter = ({ start, onCancel, textStyle, iconSize }) => {
    const [counter, setCounter] = useState(null);

    React.useEffect(() => {
        if (counter) {
            const timer = setInterval(() => {
                const secs = counter.seconds + 1;
                setCounter({
                    seconds: secs,
                    time: DateHelper.secondsToTimeZeroPadded(secs)
                });
            }, 1000);
            return () => clearInterval(timer);

        }
    }, [counter]);

    useFocusEffect(
        React.useCallback(() => {
            let ms = Date.now() - new Date(start);
            if (ms < 0) {
                ms = 0;
            }

            let secs = Math.trunc(ms / 1000);
            if (!isNaN(secs)) {
                setCounter({ seconds: secs, time: DateHelper.secondsToTimeZeroPadded(secs) });
            }

            return () => {
                setCounter(null);
            };
        }, [])
    )


    return (
        <View style={styles.row}>
            {counter?.time && <>
                <Text style={textStyle}>{counter.time.h}:{counter.time.m}:{counter.time.s}</Text>
                <Icon style={styles.icon} name="times-circle" size={iconSize} onPress={() => onCancel?.call()} />
            </>}
        </View>
    )
};



const styles = StyleSheet.create({
    row: {
        flexDirection: 'row'
    },
    icon: {
        alignSelf: 'center'
    }
});

export default Counter;