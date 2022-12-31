import React, { useState, useEffect } from 'react';
import DateHelper from 'mobile/src/helpers/date';
import {
    View,
    StyleSheet,
    Modal
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';

const PauseModal = ({ visible, seconds, onClose, onConfirm }) => {
    const [ input, setInput] = useState('')

    useEffect(() => {
        setInput(DateHelper.hmsFormat(seconds, true, true, false))
    }, [visible, seconds]);

    const onPauseConfirm = () => {
        try{
            const hmsObject = DateHelper.parseHMSFormat(input);
            const seconds = DateHelper.hmsObjectToSeconds(hmsObject);

            onConfirm?.call(this, seconds);
        }
        catch(err) {
            console.error(err);
            alert('Failed parsing input string');
        }
    }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.row}>
                        <TextInput style={styles.noteInput}
                            label='Break time'
                            mode='outlined'
                            value={input}
                            onChangeText={setInput} />
                    </View>
                    <View style={styles.row}>
                        <View style={styles.buttonCol}>
                            <Button mode='outlined'
                                onPress={onClose}
                            >
                                Cancel
                            </Button>
                        </View>
                        <View style={styles.buttonCol}>
                            <Button mode='outlined'
                                onPress={onPauseConfirm}
                            >
                                Confirm
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
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
    row: {
        flexDirection: 'row',
        paddingBottom: 10
    },
    buttonCol: {
        flex: 1,
        alignItems: 'center'
    },
    noteInput: {
        width: '50%',
        textAlign: 'center'
    },
});

export default PauseModal;