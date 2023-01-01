import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, View, ScrollView } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import RNPickerSelect from 'react-native-picker-select';
import DatePicker from './components/DatePicker';
import LoadingView from '../components/LoadingView';
import ShowAlert from 'mobile/src/helpers/alert'
import _ from 'lodash';
import TimeOffStatusBar from './components/TimeOffStatusBar';
import { TimeOffStatus } from 'mobile/src/services/constants';
import { Text, Button, TextInput } from 'react-native-paper';

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
            loadState();
        }, [])
    )

    const loadState = async () => {
        try {
            //load days off
            const doResponse = await Requests.getDaysOffLeft();
            if (!doResponse.ok) {
                throw 'failed loading days off';
            }
            const daysOff = doResponse.payload;
            setState(state => ({
                ...state,
                daysOff: daysOff
            }));

            //load time off types
            const tResponse = await Requests.getTimeOffTypes();
            if (!tResponse.ok) {
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

                setForm({
                    type: types.length > 0 ? types[0].value : null,
                    note: '',
                    startDate: start,
                    endDate: end,
                    status: null
                })
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

    const loadEntry = async (entryId, daysOff) => {
        let isReadonly = false;

        const response = await Requests.getTimeOffEntry(entryId);
        if (response.ok) {
            const item = response.payload;

            const { start, end } = prepareDateObjects(item.startDate, item.endDate, DATE_NEXT_DAY, daysOff);

            setForm({
                startDate: start,
                endDate: end,
                type: item.type.id,
                note: item.note,
                status: item.status
            });

            isReadonly = item.status !== TimeOffStatus.Pending;
        } else {
            throw `entry with id: ${entryId} not found`;
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
        //we recalculate end date because it might be incorrect after changing start date
        const { start, end } = prepareDateObjects(date, date, DATE_NEXT_DAY, state.daysOff);
        setForm(form => ({
            ...form,
            startDate: start,
            endDate: end
        }));
    }

    const onEndDateChange = (date) => {
        const end = form.endDate;
        end.date = date;
        setForm(form => ({
            ...form,
            endDate: end,
        }));
    }

    const save = async () => {
        try {
            const response = await Requests.postTimeOffSave(
                id,
                form.startDate.date,
                form.endDate.date,
                form.note,
                form.type);
            if (response.ok) {
                navigation.goBack();
            }
        }
        catch (err) {
            console.error(err);
            ShowAlert("Unknown error occurred while saving the request.");
        }
    }

    return (
        <LoadingView loading={state.loading}>
            {form && <SafeAreaView style={styles.app}>
                <ScrollView
                    style={styles.scrollView}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps='handled'>
                    <View style={styles.row}>
                        <View style={styles.labelCol}>
                            <Text variant='titleLarge'>Start</Text>
                        </View>
                        <View style={styles.controlCol}>
                            <DatePicker style={styles.date}
                                value={form.startDate.date}
                                onChange={onStartDateChange}
                                disabled={state.readonly}
                                minimumDate={form.startDate.min}
                                maximumDate={form.startDate.max} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.labelCol}>
                            <Text variant='titleLarge'>End</Text>
                        </View>
                        <View style={styles.controlCol}>
                            <DatePicker style={styles.date}
                                value={form.endDate.date}
                                onChange={onEndDateChange}
                                disabled={state.readonly}
                                minimumDate={form.endDate.min}
                                maximumDate={form.endDate.max} />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.labelCol}>
                            <Text variant='titleLarge'>Type</Text>
                        </View>
                        <View style={styles.controlCol}>
                            <RNPickerSelect
                                value={form.type}
                                disabled={state.readonly}
                                onValueChange={(value) => {
                                    if (value) {
                                        setForm(form => ({
                                            ...form,
                                            type: value
                                        }));
                                    }
                                }}
                                items={typeList}
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                disabled={state.readonly}
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

                    <View style={styles.row}>
                        <TimeOffStatusBar 
                            entryId={id} 
                            status={form.status} 
                            onChange={() => loadEntry(id, state.daysOff)} />
                    </View>
                </ScrollView>

                <View style={styles.rowFooter}>
                    <View style={styles.controlButtonCol}>
                        {id > 0 && <Button mode='outlined' onPress={() => navigation.navigate('History', { id })} >
                            History
                        </Button>}
                    </View>
                    <View style={styles.controlButtonCol}>
                        <Button mode='outlined' onPress={save} disabled={state.readonly}>
                            Save
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
            }
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