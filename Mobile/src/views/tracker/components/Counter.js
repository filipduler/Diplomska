import React, { useState } from 'react';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    Button,
} from 'react-native';

const Counter = ({ start, onCancel }) => {
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
            if(start) {
                let ms = Date.now() - new Date(start);
                if(ms < 0) {
                    ms = 0;
                }

                let secs = Math.trunc(ms / 1000);
                if (!isNaN(secs)) {
                    setCounter({ seconds: secs, time: DateHelper.secondsToTimeZeroPadded(secs) });
                }
            }

            return () => {
                setCounter(null);
            };
        }, [])
    )

    return (
        <View style={styles.row}>
            {counter?.time
            ? (<>
                    <Text style={styles.text}>{counter.time.h}:{counter.time.m}:{counter.time.s}</Text>
                    <Button onPress={() => onCancel?.call()} title="Cancel" />
                </>)
            : null}
        </View>
    )
};



const styles = StyleSheet.create({
    text: {
        fontSize: 21,
        fontWeight: "500"
    }
});

export default Counter;