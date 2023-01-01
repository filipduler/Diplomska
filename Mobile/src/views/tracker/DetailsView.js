import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, View, StyleSheet, ScrollView, Modal } from 'react-native';
import DateHelper from 'mobile/src/helpers/date';
import Requests from 'mobile/src/services/requests';
import DateTimePicker from './components/DateTimePicker';
import LoadingView from 'mobile/src/views/components/LoadingView';
import _ from 'lodash';
import ShowAlert from 'mobile/src/helpers/alert'
import { Text, Button, TextInput } from 'react-native-paper';
import PauseModal from './components/PauseModal';
import { CardStyleInterpolators } from '@react-navigation/stack';

const MIN_DATE = DateHelper.getDateWithOffset(-(60 * 24 * 3));

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [state, setState] = useState({
        loading: true,
        readonly: false,
        pauseModalVisible: false,
        startMinDate: null,
        startMaxDate: null,
        endMinDate: null,
        endMaxDate: null
    })
    const [form, setForm] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            loadState();
        }, [])
    )

    const loadState = async () => {
        try {
            if (id > 0) {
                await loadEntry(id);
            } else {
                const now = new Date();
                setForm({
                    startTime: now,
                    endTime: now,
                    pauseSeconds: 0,
                    note: ''
                })
                updateDateConstraints(now);
            }
        }
        catch (err) {
            console.error(err);
            ShowAlert("Error loading required data, try again later.");
            navigation.goBack();
        }

        setState(state => ({
            ...state,
            loading: false
        }));
    }

    const loadEntry = async (entryId) => {
        const response = await Requests.getTimeEntry(entryId);
        if (response.ok) {
            const item = response.payload;

            const start = DateHelper.convertUTCToLocal(item.startTimeUtc).toDate();
            setForm({
                startTime: start,
                endTime: DateHelper.convertUTCToLocal(item.endTimeUtc).toDate(),
                pauseSeconds: item.pauseSeconds,
                note: item.note
            })
            updateDateConstraints(start);
        } else {
            throw `entry with id: ${entryId} not found`;
        }
    }

    const save = async () => {
        try {
            const response = await Requests.postSaveEntry(
                id,
                form.startTime,
                form.endTime,
                form.pauseSeconds,
                form.note);

            if (response.ok) {
                navigation.goBack();
            }

            const errs = response.errors;
            if (errs && errs.length > 0) {
                alert(errs[0]);
            }
        }
        catch (err) {
            console.error(err);
            alert("Unknown error occurred while saving the request.");
        }
    }

    const updateDateConstraints = (start) => {
        const now = new Date();

        const endMin = new Date(start);
        endMin.setHours(endMin.getHours() + 24);

        setState(state => ({
            ...state,
            startMinDate: MIN_DATE,
            startMaxDate: now,
            endMinDate: start,
            endMaxDate: endMin
        }))
    }

    const onStartDateChange = (date) => {
        setForm(form => ({
            ...form,
            startTime: date,
            endTime: date,
        }));
        updateDateConstraints(date);
    }

    const onEndDateChange = (date) => {
        setForm(form => ({
            ...form,
            endTime: date,
        }));
    }

    const onOpenBreakModal = () => {
        setState(state => ({ ...state, pauseModalVisible: true }));
    }

    const onPauseModalClose = () => {
        setState(state => ({ ...state, pauseModalVisible: false }));
    }

    const onPauseModalConfirm = (seconds) => {
        setForm(form => ({ ...form, pauseSeconds: seconds }));
        onPauseModalClose();
    }

    return (
        <LoadingView loading={state.loading}>
            {form && <SafeAreaView style={styles.app}>
                <PauseModal visible={state.pauseModalVisible}
                    seconds={form.pauseSeconds}
                    onClose={onPauseModalClose}
                    onConfirm={onPauseModalConfirm} />
                <ScrollView
                    style={styles.scrollView}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps='handled'>
                    <View style={styles.row}>
                        <View style={styles.labelCol}>
                            <Text variant='titleLarge'>Start</Text>
                        </View>
                        <View style={styles.controlCol}>
                            <DateTimePicker
                                value={form.startTime}
                                minimumDate={state.startMinDate}
                                maximumDate={state.startMaxDate}
                                onChange={onStartDateChange} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.labelCol}>
                            <Text variant='titleLarge'>End</Text>
                        </View>
                        <View style={styles.controlCol}>
                            <DateTimePicker
                                value={form.endTime}
                                minimumDate={state.endMinDate}
                                maximumDate={state.endMaxDate}
                                onChange={onEndDateChange} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.labelCol}>
                            <Text variant='titleLarge'>Break</Text>
                        </View>
                        <View style={styles.controlCol}>
                            <Button mode='outlined'
                                style={styles.breakButton}
                                onPress={onOpenBreakModal}>
                                {DateHelper.hmsFormat(form.pauseSeconds, true, true, false)}
                            </Button>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                label='Note'
                                mode='outlined'
                                value={form.note}
                                multiline={true}
                                numberOfLines={2}
                                maxLength={512}
                                onChangeText={(text) => setForm(form => ({ ...form, note: text }))}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.rowFooter}>
                    <View style={styles.controlButtonCol}>
                        {id > 0 && <Button mode='outlined' onPress={() => navigation.navigate('History', { id })} >
                            History
                        </Button>}
                    </View>
                    <View style={styles.controlButtonCol}>
                        <Button mode='outlined' onPress={save} >
                            Save
                        </Button>
                    </View>
                </View>
            </SafeAreaView>}
        </LoadingView>
    );
};

const styles = StyleSheet.create({
    app: {
        flex: 1,
    },
    scrollView: {
        padding: 20, 
        flex: 1
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    labelCol: {
        flex: 1
    },
    controlCol: {
        flex: 4,
        alignItems: 'center'
    },
    rowFooter: {
        flexDirection: 'row',
        paddingBottom: 30
    },
    controlButtonCol: {
        flex: 1,
        alignItems: 'center'
    },
    breakButton: {
        width: '50%'
    },
});


export default DetailsView;

