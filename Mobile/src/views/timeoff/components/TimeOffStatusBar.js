import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Requests from 'mobile/src/services/requests';
import { StyleService } from 'mobile/src/services/styles';
import OpenConfirm from 'mobile/src/helpers/confirm'
import ShowAlert from 'mobile/src/helpers/alert'
import MiscServices from 'mobile/src/services/misc';
import { TimeOffStatus } from 'mobile/src/services/constants';
import Icon from 'react-native-vector-icons/FontAwesome';
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
                <View style={styles.row}>
                    <Text style={styles.statusText}>{label}</Text>
                    <View style={styles.statusCircle}>
                        <View style={[StyleService.style.circle, { backgroundColor: color }]}></View>
                    </View>
                    {isModifiable && (
                        <View style={styles.actions}>
                            {isAdminView && 
                                <Icon name="check-circle" 
                                    style={styles.actionItem} 
                                    size={25} 
                                    onPress={() => requestStatusChange(TimeOffStatus.Accepted)} />}
                            <Icon style={styles.actionItem} 
                                name="times-circle" 
                                size={25} 
                                onPress={() => requestStatusChange(isAdminView ? TimeOffStatus.Rejected : TimeOffStatus.Canceled)} />
                        </View>
                    )}
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 16, 
        fontWeight: '500',
        paddingRight: 10
    },
    statusCircle: {
        paddingRight: 10
    },
    actions: {
        flexDirection: 'row',
    },
    actionItem: {
        paddingRight: 10
    }
});

export default TimeOffStatusBar;