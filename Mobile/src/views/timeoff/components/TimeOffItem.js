import React from 'react';
import DateHelper from 'mobile/src/helpers/date';
import {
    View,
    Text,
    StyleSheet,
    Pressable
} from 'react-native';
import StyleService from 'mobile/src/services/styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const TimeOffItem = ({ data, handleEntryDetails }) => {
    const start = DateHelper.formatDate(data.startDate);
    const end = DateHelper.formatDate(data.endDate);
    const color = StyleService.getColorFromStatus(data.status);

    return (
        <Pressable onPress={() => handleEntryDetails(data.id)} style={styles.itemContainer}>
            <View style={styles.leftColumn}>
                <View style={styles.leftColumnPart}>
                    <Text>{start}</Text>
                </View>

                <View style={styles.leftColumnPart}>
                    <Icon name="minus" size={13} color="#000" />
                </View>

                <View style={styles.leftColumnPart}>
                    <Text>{end}</Text>
                </View>
            </View>
            <View style={styles.rightColumn}>
                <View style={[StyleService.style.circle, { backgroundColor: color }]}></View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftColumnPart: {
       flex: 1,
       justifyContent: 'space-evenly',
       flexDirection: 'row',
       alignItems: 'center'
    },
    leftColumn: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        //backgroundColor: 'red',
    },
    rightColumn: {
        flex: 1,
        alignItems: 'center',
        //backgroundColor: 'green',
    },
});

export default TimeOffItem;