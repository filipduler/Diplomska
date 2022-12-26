import Config from 'react-native-config'
import Store from 'mobile/src/services/store';

const Requests =
{
    /*********TIME ENTRY********/
    getTimeEntries: async (month, year) => await _innerFetch('GET', `/time-entry/${year}/${month}`),
    getTimeEntry: async (id) => await _innerFetch('GET', `/time-entry/${id}`),
    deleteTimeEntry: async (timeEntryId) => await _innerFetch('DELETE', `/time-entry/${timeEntryId}`),
    getTimeEntryHistory: async (id) => await _innerFetch('GET', `/time-entry/${id}/history`),
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

    /*********TIME OFF********/
    getTimeOffEntries: async () => await _innerFetch('GET', '/time-off'),
    getTimeOffEntry: async (id) => await _innerFetch('GET', `/time-off/${id}`),
    getTimeOffTypes: async () => await _innerFetch('GET', '/time-off/types'),
    putTimeOffCloseRequest: async (id) => await _innerFetch('PUT', `/time-off/${id}/close-request`),
    postTimeOffSave: async (body) => await _innerFetch('POST', `/time-off/save`, JSON.stringify(body)),
    getTimeOffHistory: async (id) => await _innerFetch('GET', `/time-off/${id}/history`),

    /*********HISTORY********/
    getHistory: async (from, to) => await _innerFetch('GET', `/history`, null, { from, to }),

    /*********DASHBOARD********/
    getDashboard: async () => await _innerFetch('GET', `/dashboard`),

    postLogin: async (data) => await _innerFetch('POST', `/auth/login`, JSON.stringify(data)),
}

export default Requests;


async function _innerFetch(method, url, body, params) {
    let res = null;
    console.log(body);
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