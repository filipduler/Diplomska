import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView } from 'react-native';
import DateHelper from 'mobile/helpers/date';
import BaseDateTime from 'mobile/src/components/BaseDateTime'
import Requests from 'mobile/services/requests';

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [ startTime, setStartTime ] = useState(new Date());
    const [ endTime, setEndTime ] = useState(new Date());
    const [ note, setNote ] = useState('');

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

    const deleteEntry = async () => {
        const response = await Requests.deleteTimeEntry(id);
        console.log(response);
        if(response && response.ok) {
            throw 'todo';
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
        if(response && response.ok) {
            navigation.goBack();
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                scrollEnabled={false}
                keyboardShouldPersistTaps='handled'>
                <View>
                    <Text>Start</Text>
                    <BaseDateTime value={startTime.raw} onChange={x => setStartTime(x)} />
                </View>
                <View>
                    <Text>End</Text>
                    <BaseDateTime value={endTime.raw} onChange={x => setEndTime(x)} />
                </View>
                <View>
                    <Text>Note</Text>
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

                <View>
                    <Button title='Save' onPress={save} />
                    <Button title='Delete' onPress={deleteEntry}/>
                    <Button title='History' onPress={() => navigation.navigate('History', { id: id })}/>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textInput: {
        borderColor: '#000000',
        borderWidth: 1
    }
});

export default DetailsView;

