import { StyleSheet } from 'react-native';
import { TimeOffStatus } from 'mobile/src/services/constants';

const styles = StyleSheet.create({
    circle: {
        width: 16,
        height: 16,
        borderRadius: 16 / 2,
        borderWidth: 0.8
    },
})

export const StyleService = 
{
    getColorFromStatus: (statusId) => {
        switch(statusId) {
            case TimeOffStatus.Accepted: return StatusColors.Green;
            case TimeOffStatus.Pending: return StatusColors.Orange;
            case TimeOffStatus.Canceled: 
            case TimeOffStatus.Rejected: 
            default: return StatusColors.Red;
        }
    },
    get style() {
        return styles;
    } 
};

export const StatusColors = {
    Red: '#dc3545',
    Orange: '#ffcc00',
    Green: '#99cc33'
}