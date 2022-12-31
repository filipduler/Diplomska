import React, { useState, useEffect } from 'react';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';
import Requests from 'mobile/src/services/requests';
import Counter from 'mobile/src/views/tracker/components/Counter.js';
import Store from '../../../services/store';
import { Button, TextInput } from 'react-native-paper';

const CheckInOut = () => {
    const [timer, setTimer] = useState(null);

    //save the timer
    useEffect(() => {
        Store.timer.setTimerAsync(timer);
    }, [timer]);

    useFocusEffect(
        React.useCallback(() => {
            checkActiveTimer();
        }, [])
    )

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

    const checkActiveTimer = async () => {
        const storedTimer = await Store.timer.getTimerAsync(timer);
        setTimer(storedTimer);
    }

    const pauseComponent = () => {
        let res;
        if (timer) {
            if (timer.pauseStart) {
                res = <View style={styles.row}>
                    <View style={styles.pauseColumn}>
                        <Button mode='outlined'
                            uppercase={true}
                            onPress={onResume}
                        >
                            Resume
                        </Button>
                    </View>
                    <View style={styles.pauseColumn}>
                        <Counter start={timer.pauseStart}
                            onCancel={onCancelPause}
                            iconSize={23}
                            textStyle={styles.pauseCounterText} />
                    </View>
                </View>;
            } else {
                res = <View style={styles.row}>
                    <View style={styles.pauseColumn}>
                        <Button mode='outlined'
                            uppercase={true}
                            onPress={onPause}
                        >
                            Pause
                        </Button>
                    </View>


                    {timer.pauseSecs > 0 &&
                        <View style={styles.pauseColumn}>
                            <Text style={styles.pauseCounterText}>{DateHelper.hmsFormat(timer.pauseSecs)}</Text>
                        </View>}
                </View >;
            }
        }
        return res;
    }

    return (
        <>
            {!timer
                ? (
                    <Button mode='outlined'
                        uppercase={true}
                        onPress={onCheckIn}
                    >
                        Check-in
                    </Button>
                )
                : (
                    <>
                        <View style={styles.row}>
                            <Counter start={timer.timerStart}
                                onCancel={onCancel}
                                iconSize={28}
                                textStyle={styles.mainCounterText} />
                        </View>

                        {pauseComponent()}


                        <View style={[styles.row]}>
                            <TextInput style={styles.noteTextInput}
                                label='Note'
                                mode='outlined'
                                value={timer?.note}
                                multiline={true}
                                numberOfLines={2}
                                maxLength={512}
                                onChangeText={(text) => setTimer(timer => ({
                                    ...timer,
                                    note: text
                                }))}
                            />
                        </View>
                        <Button mode='outlined'
                            uppercase={true}
                            onPress={onCheckOut}
                        >
                            Check-out
                        </Button>
                    </>
                )}
        </>
    )
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        paddingBottom: 20
    },
    noteTextInput: {
        width: '80%'
    },
    pauseCounterText: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    mainCounterText: {
        fontSize: 30,
        fontWeight: 'bold'
    },
    pauseColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default CheckInOut;