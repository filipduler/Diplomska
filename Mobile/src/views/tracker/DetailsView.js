import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView, Modal, Pressable } from 'react-native';
import DateHelper from 'mobile/src/helpers/date';
import BaseDateTime from '../components/BaseDateTime'
import Requests from 'mobile/src/services/requests';

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [pauseModal, setPauseModal] = useState({
        visible: false,
        text: '',
        pauseSeconds: 0
    });
    const [breakTextInput, setbreakTextInput] = useState(false);

    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [note, setNote] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            if (id > 0) {
                loadEntry();
            }
        }, [])
    )

    const loadEntry = async () => {
        const response = await Requests.getTimeEntry(id);
        if (response && response.ok) {
            const item = response.payload;

            const startTime = DateHelper.convertUTCToLocal(item.startTimeUtc);
            setStartTime(startTime.toDate());

            const endTime = DateHelper.convertUTCToLocal(item.endTimeUtc);
            setEndTime(endTime.toDate());

            setNote(item.note);
        }
    }

    const save = async () => {
        const response = await Requests.postSaveEntry(
            id,
            startTime, 
            endTime, 
            pauseModal.pauseSeconds, 
            note);

        if (response && response.ok) {
            navigation.goBack();
        }
    }

    const onOpenBreakModal = () => {
        setPauseModal(pause => ({
            ...pause,
            visible: true,
            text: DateHelper.hmsFormat(pause.pauseSeconds, true, true, false)
        }));
    }

    const onPauseModalClose = () => {
        setPauseModal(pause => ({
            ...pause,
            visible: false,
            text: ''
        }));
    }

    const onPauseModalConfirm = () => {
        const hmsObject = DateHelper.parseHMSFormat(pauseModal.text);
        const seconds = DateHelper.hmsObjectToSeconds(hmsObject);

        setPauseModal(pause => ({
            ...pause,
            pauseSeconds: seconds,
            visible: false
        }));
    }

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={pauseModal.visible}
                onRequestClose={onPauseModalClose}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Break time</Text>
                        <TextInput 
                            value={pauseModal.text} 
                            onChangeText={x => setPauseModal(pause => ({...pause, text: x }))} />
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
                    <BaseDateTime style={styles.date}
                        value={startTime}
                        onChange={x => setStartTime(x)} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>End</Text>
                    <BaseDateTime style={styles.date}
                        value={endTime}
                        onChange={x => setEndTime(x)} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Break</Text>
                    <Button 
                        style={styles.date} 
                        title={DateHelper.hmsFormat(pauseModal.pauseSeconds, true, true, false)} 
                        onPress={onOpenBreakModal} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Note</Text>
                </View>
                <View>
                    <TextInput
                        multiline={true}
                        numberOfLines={3}
                        value={note}
                        onChangeText={(text) => setNote(text)}
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
        </SafeAreaView>
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

