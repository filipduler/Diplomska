import React, { useState, useEffect } from 'react';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    StyleSheet,
    Button,
    Text,
    TextInput
} from 'react-native';
import Requests from 'mobile/src/services/requests';
import Counter from 'mobile/src/views/tracker/components/Counter.js';
import Store from '../../../services/store';

const CheckInOut = () => {
    const [timer, setTimer] = useState(null);
    
    //save the timer
    useEffect(() => {
        Store.timer.setTimerAsync(timer);
    }, [timer]);

    const onCheckIn = async () => {
        setTimer({
            timerStart: Date.now(),
            pauseStart: null,
            pauseSecs: 0,
            note: '',
        });
    }

    const onCheckOut = async () => {
        const response = await Requests.postSaveEntry(
            null,
            new Date(timer.timerStart),
            new Date(Date.now()),
            timer.pauseSecs,
            timer.note);
        if (response && response.ok) {
            await onCancel();
        }
    }

    const onCancel = async () => {
        setTimer(null);
        await Store.timer.removeTimerAsync();
    }

    const onPause = () => {
        let now;

        //in case we already have pause seconds we start counting with the previous
        //time already counted in
        if (timer.pauseSecs > 0) {
            now = Date.now() - (timer.pauseSecs * 1000);
        }
        setTimer(timer => ({
            ...timer,
            pauseStart: now ?? Date.now()
        }));
    }

    const onCancelPause = () => {
        setTimer(timer => ({
            ...timer,
            pauseStart: null
        }));
    }

    const onResume = () => {
        let start = timer.pauseStart;

        //if we already have active seconds add them to the new time delta
        if (timer.pauseSecs > 0) {
            start = timer.pauseStart + (timer.pauseSecs * 1000);
        }

        let pauseSecs = 0;
        let secs = DateHelper.timeDiffInSec(start);
        if (secs) {
            pauseSecs = timer.pauseSecs + secs;
        }

        setTimer(timer => ({
            ...timer,
            pauseStart: null,
            pauseSecs: pauseSecs
        }));
    }

    useFocusEffect(
        React.useCallback(() => {
            checkActiveTimer();
        }, [])
    )

    const checkActiveTimer = async () => {
        const storedTimer = await Store.timer.getTimerAsync(timer);
        setTimer(storedTimer);
    }

    const pauseComponent = () => {
        let res;
        if (timer) {
            if (timer.pauseStart) {
                res = <>
                    <Counter start={timer.pauseStart} onCancel={onCancelPause} />
                    <Button onPress={onResume} title="Resume" />
                </>;
            } else {
                res = <>
                    {timer.pauseSecs > 0 ? <Text style={{ fontSize: 21, fontWeight: "500" }}>{DateHelper.hmsFormat(timer.pauseSecs)}</Text> : null}
                    <Button onPress={onPause} title="Pause" />
                </>;
            }
        }
        return res;
    }

    return (
        <View style={styles.row}>
            {!timer
                ? (<Button onPress={onCheckIn} title="Check-in" />)
                : (
                    <>

                        <Counter start={timer.timerStart} onCancel={onCancel} />
                        {pauseComponent()}

                        <TextInput
                            multiline={true}
                            numberOfLines={3}
                            value={timer?.note}
                            onChangeText={(text) => setTimer(timer => ({
                                ...timer,
                                note: text
                            }))}
                            style={styles.textInput}
                            maxLength={512}
                            textAlignVertical='top'
                        />
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