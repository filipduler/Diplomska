import { TimeOffStatus } from 'mobile/src/services/constants';
import Auth from 'mobile/src/services/auth';

const MiscServices = {
    getTimeOffStatusName: (timeOffStatusId) => {
        switch(timeOffStatusId) {
            case TimeOffStatus.Pending: return 'Pending'; 
            case TimeOffStatus.Accepted: return 'Accepted'; 
            case TimeOffStatus.Rejected: return 'Rejected'; 
            case TimeOffStatus.Canceled: return 'Canceled'; 
            default: return '';
        }
    },
    getWho: (modifierUserId, modifierName) => {
        return Auth.userInfo.userId === modifierUserId ? 'You' : modifierName;
    }
}
export default MiscServices;