import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView, Modal, Pressable } from 'react-native';
import DateHelper from 'mobile/src/helpers/date';
import Requests from 'mobile/src/services/requests';
import DateTimePicker from './components/DateTimePicker';
import LoadingView from 'mobile/src/views/components/LoadingView';
import _ from 'lodash';
import ShowAlert from 'mobile/src/helpers/alert'

const MIN_DATE = DateHelper.getDateWithOffset(-(60 * 24 * 3));

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [state, setState] = useState({
        loading: true,
        readonly: false,
        pause: {
            visible: false,
            text: '',
        },
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
            if(errs && errs.length > 0) {
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
        console.log('onStartDateChange ', date);
        setForm(form => ({
            ...form,
            startTime: date,
            endTime: date,
        }));
        updateDateConstraints(date);
    }

    const onEndDateChange = (date) => {
        console.log('onEndDateChange ', date);
        setForm(form => ({
            ...form,
            endTime: date,
        }));
    }

    const onOpenBreakModal = () => {
        const pause = {
            visible: true,
            text: DateHelper.hmsFormat(form.pauseSeconds, true, true, false)
        };

        setState(state => ({ ...state, pause: pause }));
    }

    const onPauseModalClose = () => {
        const pause = {
            visible: false,
            text: ''
        };

        setState(state => ({ ...state, pause: pause }));
    }

    const onPauseModalConfirm = () => {
        const hmsObject = DateHelper.parseHMSFormat(state.pause.text);
        const seconds = DateHelper.hmsObjectToSeconds(hmsObject);

        //close modal
        onPauseModalClose();

        //save seconds
        setForm(form => ({ ...form, pauseSeconds: seconds }));
    }

    return (
        <LoadingView loading={state.loading}>
            {form && <SafeAreaView style={styles.container}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={state.pause.visible}
                    onRequestClose={onPauseModalClose}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Break time</Text>
                            <TextInput
                                value={state.pause.text}
                                onChangeText={x => {
                                    const pauseClone = _.cloneDeep(state.pause);
                                    pauseClone.text = x;
                                    setState(state => ({ ...state, pause: pauseClone }))
                                }} />
                            <Button
                                title='Cancel'
                                onPress={onPauseModalClose}
                            />
                            <Button
                                title='Confirm'
                                onPress={onPauseModalConfirm}
                            />
                        </View>
                    </View>
                </Modal>
                <ScrollView
                    style={{ padding: 20, flex: 1 }}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps='handled'>
                    <View style={styles.row}>
                        <Text style={styles.label}>Start</Text>
                        <DateTimePicker style={styles.date}
                            value={form.startTime}
                            minimumDate={state.startMinDate}
                            maximumDate={state.startMaxDate}
                            onChange={onStartDateChange} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>End</Text>
                        <DateTimePicker style={styles.date}
                            value={form.endTime}
                            minimumDate={state.endMinDate}
                            maximumDate={state.endMaxDate}
                            onChange={onEndDateChange} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Break</Text>
                        <Button
                            style={styles.date}
                            title={DateHelper.hmsFormat(form.pauseSeconds, true, true, false)}
                            onPress={onOpenBreakModal} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Note</Text>
                    </View>
                    <View>
                        <TextInput
                            multiline={true}
                            numberOfLines={3}
                            value={form.note}
                            onChangeText={(text) => setForm(form => ({ ...form, note: text }))}
                            style={styles.textInput}
                            maxLength={512}
                            textAlignVertical='top'
                        />
                    </View>
                </ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10, paddingBottom: 30 }}>
                    <Button title='History'
                        onPress={() => navigation.navigate('History', { id: id })} />
                    <Button title='Save' onPress={save} />
                </View>
            </SafeAreaView>}
        </LoadingView>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    container: {
        flex: 1,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 30
    },
    label: {
        flex: 1,
        fontSize: 20,
        fontWeight: '500'
    },
    date: {
        flex: 6,
    },
    textInput: {
        borderColor: '#000000',
        borderWidth: 1
    }
});

export default DetailsView;

