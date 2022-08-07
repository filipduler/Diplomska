const MiscServices = {
    getTimeOffStatusName: (timeOffStatusId) => {
        let name = null;
        switch(timeOffStatusId) {
            case 1: name = 'Pending'; break;
            case 2: name = 'Accepted'; break;
            case 3: name = 'Rejected'; break;
            case 4: name = 'Canceled'; break;
        }
        return name;
    }
}

export default MiscServices;