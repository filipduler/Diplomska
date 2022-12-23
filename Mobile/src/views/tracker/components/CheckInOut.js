import React, { useState, useEffect } from 'react';
import DateHelper from 'mobile/src/helpers/date';
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
import Requests from 'mobile/src/services/requests';
import Counter from 'mobile/src/views/tracker/components/Counter.js';
import Store from '../../../services/store';

const CheckInOut = (props) => {
    const [timer, setTimer] = useState(null);

    const onCheckIn = async () => {
        setTimer({
            timerStart: Date.now(),
            pauseStart: null
        });
    }

    const onCheckOut = async () => {
        const timeEntryId = activeTimer.id;
        setCheckIn(!checkIn);
        stopTimer();

        const res = await Requests.postStopTimer(timeEntryId);
        console.log(res);

        //refresh list of entries
        props.onNewEntry?.call();
    }
    
    const onCancel = () => {
        setTimer(null)
    }
    
    const onPause = () => {
        timer.pauseStart = Date.now();
        setTimer(timer);
    }

    const onCancelPause = () => {
        timer.pauseStart = null;
        setTimer(timer);
    }

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus');
            //checkActiveTimer();

            return () => {
                //on unfocus
                console.log('unfocus');
                //setCounter(null);
            };
        }, [])
    )

    const checkActiveTimer = async () => {
        const activeTimer = await Store.timer.getTimerAsync();

        if(activeTimer) {

            let ms = Date.now() - new Date(activeTimer.start);
            if(ms < 0) {
                ms = 0;
            }
            console.log('ms ', ms);
            let secs = Math.trunc(ms / 1000);
            if (!isNaN(secs)) {
                setCounter({ seconds: secs, time: DateHelper.secondsToTimeZeroPadded(secs) });
            }

            setCheckIn(true);
            startTimer(activeTimer);
        }
    }
    return (
        <View style={styles.row}>
            {!timer
            ? (<Button onPress={onCheckIn} title="Check-in" />)
            : (
                <>
                    
                    <Counter start={timer.timerStart} onCancel={onCancel} />
                    {timer.pauseStart 
                        ? (<Counter start={timer.pauseStart} onCancel={onCancel} />)
                        : (<Button onPress={onCancelPause} title="Pause" />)}
                        
                    <Button onPress={onCheckOut} title="Check-out" />
                </>
            )}
        </View>
    )
};



const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    text: {
        fontSize: 21,
        fontWeight: "500"
    }
});

export default CheckInOut;