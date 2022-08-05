import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView } from 'react-native';
import DateHelper from 'mobile/src/helpers/date';
import BaseDateTime from '../components/BaseDateTime'
import Requests from 'mobile/src/services/requests';

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [note, setNote] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus DetailsView');
            if (id > 0) {
                loadEntry();
            }

            return () => {
                //on unfocus
                console.log('unfocus DetailsView');
            };
        }, [])
    )

    const loadEntry = async () => {
        const response = await Requests.getTimeEntry(id);
        console.log(response);
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
        const body = {
            id: id > 0 ? id : null,
            startTime: startTime,
            endTime: endTime,
            note: note
        };

        const response = await Requests.postSaveEntry(body);
        console.log(response);
        if (response && response.ok) {
            navigation.goBack();
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{  padding: 20, flex: 1 }}
                scrollEnabled={false}
                keyboardShouldPersistTaps='handled'>
                <View style={styles.row}>
                    <Text style={styles.label}>Start</Text>
                    <BaseDateTime style={styles.date}
                        value={startTime.raw}
                        onChange={x => setStartTime(x)} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>End</Text>
                    <BaseDateTime style={styles.date}
                        value={endTime.raw}
                        onChange={x => setEndTime(x)} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Note</Text>
                </View>
                <View>
                    <TextInput
                        multiline={true}
                        numberOfLines={11}
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

