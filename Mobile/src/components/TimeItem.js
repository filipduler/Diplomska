import React, {useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Button,
    TouchableOpacity,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

let rowDict = {};
let prevOpenedRow;

export const TimeItem = (props) => {

    const closeRow = (id) => {
        if (prevOpenedRow && prevOpenedRow !== rowDict[id]) {
            prevOpenedRow.close();
        }
        prevOpenedRow = rowDict[id];
    }

    const leftSwipe = () => {
        return (
            <TouchableOpacity onPress={props.handleDelete} activeOpacity={0.6}>
                <View style={styles.deleteBox}>
                    <Text>Delete</Text>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <GestureHandlerRootView>
            <Swipeable renderRightActions={leftSwipe}  
                ref={ref => rowDict[props.data.id] = ref} 
                key={props.data.id}
                onBegan={() => closeRow(props.data.id)}>
                <View style={styles.container} >
                    <TouchableOpacity onPress={props.handleDetails}>
                        <Text>{props.data.title} {props.data.notePreview}</Text>
                    </TouchableOpacity>
                </View>
            </Swipeable>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 80,
        width: SCREEN_WIDTH,
        backgroundColor: 'white',
        justifyContent: 'center',
        padding: 16,
    },
    deleteBox: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 80,
    },
});