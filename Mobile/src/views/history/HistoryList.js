import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SectionList, Text } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import moment, { isMoment } from 'moment';
import _ from 'lodash';

const HistoryList = ({ navigation }) => {
    const [keys, setKeys] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus HistoryView');
            loadHistory();

            return () => {
                //on unfocus
                console.log('unfocus HistoryView');
            };
        }, [])
    )

    const loadHistory = async () => {
        const arr = [];
        try{
            const response = await Requests.getHistory();
            console.log(response);
            if(response && response.ok && response.payload) {
                const groupedResults = _.groupBy(response.payload, x => DateHelper.roundToDayAsUnix(x.lastUpdateOnUtc));

                for (const unix of Object.keys(groupedResults)) {
                    arr.push({
                        text: DateHelper.formatDate(moment.unix(unix)),
                        data: groupedResults[unix]
                    })
                }
            }
        } 
        finally {
            console.log(arr);
            setKeys(arr);
        }
    }

    const navigateToHistoryView = (id, type) => {
        if(type === 'TE') {
            navigation.navigate('Tracker History', { id: id })
        } else if (type === 'TF') {
            navigation.navigate('Time Off History', { id: id })
        }
    }

    return (
        <SectionList
            sections={keys}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => <Text onPress={() => navigateToHistoryView(item.id, item.type)}>{item.type}</Text>}
            renderSectionHeader={({ section }) => <Text>{section.text}</Text>}
        />
    );
};

export default HistoryList;