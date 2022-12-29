import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Requests from 'mobile/src/services/requests';
import StyleService from 'mobile/src/services/styles';
import OpenConfirm from 'mobile/src/helpers/confirm'
import ShowAlert from 'mobile/src/helpers/alert'
import MiscServices from 'mobile/src/services/misc';
import { TimeOffStatus } from 'mobile/src/services/constants';
import Icon from 'react-native-vector-icons/AntDesign';
import Auth from 'mobile/src/services/auth';

const TimeOffStatusBar = ({ entryId, status, onChange }) => {
    
    const label = MiscServices.getTimeOffStatusName(status);
    const color = StyleService.getColorFromStatus(status);
    const isModifiable = status === TimeOffStatus.Pending;
    const isAdminView = Auth.userInfo.isAdmin;

    const requestStatusChange = async (status) => {
        OpenConfirm('Status change request', 'Are you sure?', 'Confirm', async () => {
            try {
                const response = await Requests.putTimeOffUpdateStatus(entryId, status);
                if (response.ok) {
                    onChange?.call();
                }
            }
            catch (err) {
                console.error(err);
                ShowAlert("Unknown error occurred while changing status.");
            }
        })
    }

    return (
        <>
            {status && (
                <View style={[styles.row, { paddingTop: 15 }]}>
                    <Text style={{ paddingLeft: 10, fontSize: 16, fontWeight: '500' }}>{label}</Text>
                    <View style={{ paddingLeft: 10 }}>
                        <View style={[StyleService.style.circle, { backgroundColor: color }]}></View>
                    </View>
                    {isModifiable && (
                        <View style={{ paddingLeft: 20 }}>
                            <Icon name="close" size={21} onPress={() => requestStatusChange(isAdminView ? TimeOffStatus.Rejected : TimeOffStatus.Canceled)} />
                            {isAdminView && <Icon name="check" size={21} onPress={() => requestStatusChange(TimeOffStatus.Accepted)} />}
                        </View>
                    )}
                </View>
            )}
        </>
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

export default TimeOffStatusBar;