import { TimeOffStatus } from 'mobile/src/services/constants';

const MiscServices = {
    getTimeOffStatusName: (timeOffStatusId) => {
        switch(timeOffStatusId) {
            case TimeOffStatus.Pending: return 'Pending'; 
            case TimeOffStatus.Accepted: return 'Accepted'; 
            case TimeOffStatus.Rejected: return 'Rejected'; 
            case TimeOffStatus.Canceled: return 'Canceled'; 
            default: return '';
        }
    }
}
export default MiscServices;