import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, StyleSheet, View, TextInput, ScrollView } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import RNPickerSelect from 'react-native-picker-select';
import StyleService from 'mobile/src/services/styles';
import OpenConfirm from 'mobile/src/helpers/confirm'
import MiscServices from 'mobile/src/services/misc';
import DatePicker from './components/DatePicker';
import LoadingView from '../components/LoadingView';
import _ from 'lodash';


const DATE_NEXT_DAY = DateHelper.getDateWithOffset(60 * 24);

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [state, setState] = useState({
        daysOff: 0,
        loading: true,
        readonly: false,
        startMinDate: null,
        startMaxDate: null,
        endMinDate: null,
        endMaxDate: null
    })
    const [typeList, setTypeList] = useState([])
    const [form, setForm] = useState(null)

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus DetailsView');
            loadState();

            return () => {
                //on unfocus
                console.log('unfocus DetailsView');
            };
        }, [])
    )


    const loadState = async () => {
        //load days off
        const doResponse = await Requests.getDaysOffLeft();
        if (!doResponse || !doResponse.ok) {
            throw 'failed loading days off';
        }
        const daysOff = doResponse.payload;

        //load time off types
        const tResponse = await Requests.getTimeOffTypes();
        if (!tResponse || !tResponse.ok) {
            throw 'failed loading time off types';
        }

        const types = tResponse.payload.map(x => {
            return { label: x.name, value: x.id }
        });
        setTypeList(types);

        if (id > 0) {
            await loadEntry(id);
        } else {
            const { start, end } = prepareDateObjects(DATE_NEXT_DAY, DATE_NEXT_DAY, DATE_NEXT_DAY, daysOff);
            console.log(start, end);
            setForm({
                type: types.length > 0 ? types[0].value : null,
                note: '',
                startDate: start,
                endDate: end,
                status: null
            })
        }

        setState(state => ({
            ...state,
            daysOff: daysOff,
            loading: false
        }));
    }

    

    const loadEntry = async (entryId, daysOff) => {
        let isReadonly = false;

        const response = await Requests.getTimeOffEntry(entryId);
        if (response && response.ok) {
            const item = response.payload;

            const { start, end } = prepareDateObjects(item.startDate, item.endDate, DATE_NEXT_DAY, daysOff);

            setForm({
                startDate: start,
                endDate: end,
                type: item.type.id,
                note: item.note,
                status: {
                    isFinished: item.isFinished,
                    isCancellable: item.isCancellable,
                    label: MiscServices.getTimeOffStatusName(item.status),
                    color: StyleService.getColorFromStatus(item.status)
                }
            });

            if (item.isFinished) {
                isReadonly = true;
            }
        }

        setState(state => ({
            ...state,
            readonly: isReadonly
        }));
    }

    const prepareDateObjects = (startDate, endDate, absoluteMinDate, daysOff) => {
        const start = DateHelper.convertUTCToLocal(startDate).toDate();
        const end = DateHelper.convertUTCToLocal(endDate).toDate();

        const startObj = {
            date: start,
            min: absoluteMinDate,
            max: null //TODO technically this should be n (available days off) days before the year ends 
        };
        
        const endObj = {
            date: end,
            min: start,
            max: DateHelper.calculateWorkingDays(start, daysOff) //TODO should exclude holidays...
        }

        return {
            start: startObj,
            end: endObj
        }
    }

    const onStartDateChange = (date) => {
        console.log('changind start date: ', date);

        //we recalculate end date because it might be incorrect after changing start date
        const { start, end } = prepareDateObjects(date, date, DATE_NEXT_DAY, state.daysOff);
        setForm(form => ({
            ...form,
            startDate: start,
            endDate: end
        }));
    }

    const onEndDateChange = (date) => {
        console.log('changind end date: ', date);
        const end = form.endDate;
        end.date = date;
        setForm(form => ({
            ...form,
            endDate: end,
        }));
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
        const response = await Requests.postTimeOffSave(
            id, 
            form.startDate.date, 
            form.endDate.date, 
            form.note, 
            form.type);
        if (response && response.ok) {
            navigation.goBack();
        }
    }

    return (
        <LoadingView loading={state.loading}>
            {form && <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={{ padding: 20, flex: 1 }}
                        scrollEnabled={false}
                        keyboardShouldPersistTaps='handled'>
                        <View style={styles.row}>
                            <Text style={styles.label}>Start</Text>
                            <DatePicker style={styles.date}
                                value={form.startDate.date}
                                onChange={onStartDateChange}
                                disabled={state.readonly}
                                minimumDate={form.startDate.min}
                                maximumDate={form.startDate.max} />
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>End</Text>
                            <DatePicker style={styles.date}
                                value={form.endDate.date}
                                onChange={onEndDateChange}
                                disabled={state.readonly}
                                minimumDate={form.endDate.min}
                                maximumDate={form.endDate.max} />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.date}>
                                {!state.readonly ? (
                                    <RNPickerSelect
                                        value={form.type}
                                        onValueChange={(value) => {
                                            if (value) {
                                                console.log(value);
                                                setForm(form => ({
                                                    ...form,
                                                    type: value
                                                }));
                                            }
                                        }}
                                        items={typeList}
                                    />
                                ) : (<Text>{form.type.name}</Text>)}

                            </View>

                        </View>
                        <View style={{ paddingBottom: 10 }}>
                            <Text style={styles.label}>Note</Text>
                        </View>
                        <View>
                            {!state.readonly ? (
                                <TextInput
                                    multiline={true}
                                    numberOfLines={6}
                                    value={form.note}
                                    onChangeText={text => setForm(form => ({
                                        ...form,
                                        note: text
                                    }))}
                                    style={styles.textInput}
                                    maxLength={512}
                                    textAlignVertical='top'
                                />
                            ) : (<Text>{form.note}</Text>)}

                        </View>

                        {form.status && (
                            <View style={[styles.row, { paddingTop: 15 }]}>
                                <Text style={{ paddingLeft: 10, fontSize: 16, fontWeight: '500' }}>{form.status.label}</Text>
                                <View style={{ paddingLeft: 10 }}>
                                    <View style={[StyleService.style.circle, { backgroundColor: form.status.color }]}></View>
                                </View>
                                {form.status.isCancellable && (
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
                            <Button title='Save' onPress={save} disabled={!(id === 0 || (form.status !== null && !form.status.isFinished))} />
                        </View>
                    </View>
                </SafeAreaView>
            }
        </LoadingView>
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