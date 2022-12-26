import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, StyleSheet, View, TextInput, ScrollView } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import RNPickerSelect from 'react-native-picker-select';
import StyleService from 'mobile/src/services/styles';
import BaseDateTime from '../components/BaseDateTime'
import OpenConfirm from 'mobile/src/helpers/confirm'
import MiscServices from 'mobile/src/services/misc';

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [ readonlyMode, setReadonlyMode ] = useState(false)

    const [typeList, setTypeList] = useState([])
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [type, setType] = useState({id: 1});
    const [note, setNote] = useState('');
    const [status, setStatus] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus DetailsView');
            if (id > 0) {
                loadEntry();
            }
            loadTypes();

            return () => {
                //on unfocus
                console.log('unfocus DetailsView');
            };
        }, [])
    )

    const loadEntry = async () => {
        setReadonlyMode(false);

        const response = await Requests.getTimeOffEntry(id);
        console.log(response);
        if (response && response.ok) {
            const item = response.payload;

            const startTime = DateHelper.convertUTCToLocal(item.startTimeUtc);
            setStartTime(startTime);

            const endTime = DateHelper.convertUTCToLocal(item.endTimeUtc);
            setEndTime(endTime);
console.log('wtf',item.type);
            setType(item.type);
            setNote(item.note);
            setStatus({
                isFinished: item.isFinished,
                isCancellable: item.isCancellable,
                label: MiscServices.getTimeOffStatusName(item.status),
                color: StyleService.getColorFromStatus(item.status)
            })

            if (item.isFinished) {
                setReadonlyMode(true);
            }
        }
    }

    const loadTypes = async () => {
        const response = await Requests.getTimeOffTypes();
        console.log(response);
        if (response && response.ok) {
            setTypeList(response.payload.map(x => {
                return { label: x.name, value: x.id }
            }));
        }
    }

    const closeRequest = async () => {
        OpenConfirm('Close time off request', 'Are you sure?', 'Close', async () => {
            const response = await Requests.putTimeOffCloseRequest(id);
            if (response && response.ok) {
                await loadEntry();
            }
        })
    }

    const save = async () => {
        const response = await Requests.postTimeOffSave(id, startTime, endTime, note, type);
        console.log(response);
        if (response && response.ok) {
            navigation.goBack();
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ padding: 20, flex: 1 }}
                scrollEnabled={false}
                keyboardShouldPersistTaps='handled'>
                <View style={styles.row}>
                    <Text style={styles.label}>Start</Text>
                    <BaseDateTime style={styles.date}
                        value={startTime.raw}
                        onChange={x => setStartTime(x)}
                        disabled={readonlyMode} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>End</Text>
                    <BaseDateTime style={styles.date}
                        value={endTime.raw}
                        onChange={x => setEndTime(x)}
                        disabled={readonlyMode} />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.date}>
                        {!readonlyMode ? (
                            <RNPickerSelect
                                disabled={readonlyMode}
                                value={type.id}
                                onValueChange={(value) => !!value ? setType(value) : null}
                                items={typeList}
                            />
                        ) : (<Text>{type.name}</Text>)}
                        
                    </View>

                </View>
                <View style={{ paddingBottom: 10 }}>
                    <Text style={styles.label}>Note</Text>
                </View>
                <View>
                    {!readonlyMode ? (
                        <TextInput
                            multiline={true}
                            numberOfLines={6}
                            value={note}
                            onChangeText={(text) => setNote(text)}
                            style={styles.textInput}
                            maxLength={512}
                            textAlignVertical='top'
                        />
                    ) : (<Text>{note}</Text>)}

                </View>

                {status !== null && (
                    <View style={[styles.row, { paddingTop: 15 }]}>
                        <Text style={{ paddingLeft: 10, fontSize: 16, fontWeight: '500' }}>{status.label}</Text>
                        <View style={{ paddingLeft: 10 }}>
                            <View style={[StyleService.style.circle, { backgroundColor: status.color }]}></View>
                        </View>
                        {status.isCancellable && (
                            <View style={{ paddingLeft: 20 }}>
                                <Button title='Close' onPress={closeRequest} />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10, paddingBottom: 30 }}>
                <View>
                    {id > 0 && (
                        <Button title='History' onPress={() => navigation.navigate('History', { id: id })} />
                    )}
                </View>
                
                <View>
                    <Button title='Save' onPress={save} disabled={!(id === 0 || (status !== null && !status.isFinished))} />
                </View>
                </View>
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