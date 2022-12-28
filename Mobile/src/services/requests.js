import Config from 'react-native-config'
import Store from 'mobile/src/services/store';

const Requests =
{
    /*********TIME ENTRY********/
    getTimeEntries: async (month, year) => await _innerFetch('GET', `/time-entry/${year}/${month}`),
    getTimeEntryStats: async () => await _innerFetch('GET', '/time-entry/stats'),
    getTimeEntry: async (id) => await _innerFetch('GET', `/time-entry/${id}`),
    deleteTimeEntry: async (timeEntryId) => await _innerFetch('DELETE', `/time-entry/${timeEntryId}`),
    getTimeEntryHistory: async (id) => await _innerFetch('GET', `/time-entry/${id}/history`),
    getTimeEntryChanges: async (from, to) => await _innerFetch('GET', `/time-entry/changes`, null, { from, to }),
    postSaveEntry: async (id, startTimeUtc, endTimeUtc, pauseSeconds, note) => {
        const request = {
            id: id > 0 ? id : null,
            startTimeUtc: startTimeUtc,
            endTimeUtc: endTimeUtc,
            pauseSeconds: pauseSeconds,
            note: note
        };

        return await _innerFetch('POST', '/time-entry/save', JSON.stringify(request));
    },
    getDaysCompleted: async (month, year) => await _innerFetch('GET', `/time-entry/days-completed/${year}/${month}`),

    /*********TIME OFF********/
    getTimeOffEntries: async () => await _innerFetch('GET', '/time-off'),
    getTimeOffEntriesByStatus: async (status) => await _innerFetch('GET', `/time-off/status/${status}`),
    getTimeOffEntry: async (id) => await _innerFetch('GET', `/time-off/${id}`),
    getTimeOffTypes: async () => await _innerFetch('GET', '/time-off/types'),
    putTimeOffCloseRequest: async (id) => await _innerFetch('PUT', `/time-off/${id}/close-request`),
    postTimeOffSave: async (id, startTimeUtc, endTimeUtc, note, typeId) => {
        const request = {
            id: id > 0 ? id : null,
            startTimeUtc: startTimeUtc,
            endTimeUtc: endTimeUtc,
            note: note,
            typeId: typeId
        };

        return await _innerFetch('POST', '/time-off/save', JSON.stringify(request));
    },
    getTimeOffHistory: async (id) => await _innerFetch('GET', `/time-off/${id}/history`),
    getTimeOffChanges: async (from, to) => await _innerFetch('GET', `/time-off/changes`, null, { from, to }),
    getDaysOff: async (month, year) => await _innerFetch('GET', `/time-off/days-off/${year}/${month}`),

    /*********HISTORY********/
    getHistory: async (from, to) => await _innerFetch('GET', `/history`, null, { from, to }),

    /*********DASHBOARD********/
    getDashboard: async () => await _innerFetch('GET', `/dashboard`),

    /*********AUTH********/
    postLogin: async (email, password) => {
        const request = {
            email: email, 
            password: password
        };
        return await _innerFetch('POST', `/auth/login`, JSON.stringify(request));
    },

     /*********USERS********/
     getUserInfo: async () => await _innerFetch('GET', '/user/info'),
     getUsers: async () => await _innerFetch('GET', '/user/users'),
     postImpersonate: async (userId) => await _innerFetch('POST', `/user/impersonate/${userId}`),
     postClearImpersonation: async () => await _innerFetch('POST', '/user/clear-impersonation'),
}

export default Requests;


async function _innerFetch(method, url, body, params) {
    let res = null;
    try {
        let parameters = '';
        if(params) {
            parameters = `?${new URLSearchParams(params)}`;
        }
        
        const response = await fetch(Config.API_HOST + url + parameters, {
            method: method,
            body: body,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await Store.auth.getJWTAsync()}`
            }
        });
        if (response.ok) {
            res = await response.json();
        }
    }
    catch (err) {
        console.error(err);
    }
    return res;
}