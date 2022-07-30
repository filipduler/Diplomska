import React, { useState, useEffect } from 'react';
import DateHelper from 'mobile/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    Button,
    Dimensions,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { postStartTimer, postStopTimer, getCheckTimer, postCancelTimer } from '../../services/requests'

let activeTimer = null;

export const CheckInOut = (props) => {
    const [checkIn, setCheckIn] = useState(true);
    const [counter, setCounter] = useState(null);

    const onCheckIn = async () => {
        const res = await postStartTimer();
        console.log(res);
        if(res && res.ok) {
            setCheckIn(!checkIn);
            startTimer(res.payload);
        }
    }

    const onCheckOut = async () => {
        const timeEntryId = activeTimer.id;
        setCheckIn(!checkIn);
        stopTimer();

        const res = await postStopTimer(timeEntryId);
        console.log(res);

        //refresh list of entries
        props.onNewEntry?.call();
    }
    
    const onCancel = async () => {
        setCheckIn(!checkIn);
        stopTimer();
        
        const res = await postCancelTimer();
        console.log(res);
    }

    React.useEffect(() => {
        if (counter) {
            const timer = setInterval(() => {
                const secs = counter.seconds + 1;
                setCounter({
                    seconds: secs,
                    time: DateHelper.secondsToTime(secs)
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [counter]);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus');
            checkActiveTimer();

            return () => {
                //on unfocus
                console.log('unfocus');
                setCounter(null);
            };
        }, [])
    )

    const checkActiveTimer = async () => {
        if(activeTimer) {
            setCheckIn(false);
            startTimer(activeTimer);
        } else {
            const res = await getCheckTimer();
            if (res) {
                setCheckIn(!res.ok);
                if (res.ok) {
                    startTimer(res.payload);
                }
            } else {
                setCheckIn(true);
            }
        }
        
    }

    const startTimer = (timer) => {
        activeTimer = timer;
        if (timer) {
            let ms = Date.now() - new Date(timer.startTimeUtc);
            if(ms < 0) {
                ms = 0;
            }

            let secs = Math.trunc(ms / 1000);
            if (!isNaN(secs)) {
                setCounter({ seconds: secs, time: DateHelper.secondsToTime(secs) });
            }
        }
    }

    const stopTimer = () => {
        setCounter(null);
        activeTimer = null;
    }

    return (checkIn
        ? (
            <View>
                <Text></Text>
                <Button onPress={onCheckIn} title="Check-in" />
            </View>
        )
        : (
            <View>
                {counter?.time ? (<Text>{counter.time.h}:{counter.time.m}:{counter.time.s}</Text>) : null}
                <Button onPress={onCancel} title="Cancel" />
                <Button onPress={onCheckOut} title="Check-out" />
            </View>
        )
    );
};