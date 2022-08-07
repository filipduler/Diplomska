import Config from 'react-native-config'

const Requests =
{
    /*********TIME ENTRY********/
    getTimeEntries: async (month, year) => await _innerFetch('GET', `/entry/${year}/${month}`),
    getTimeEntry: async (id) => await _innerFetch('GET', `/entry/${id}`),
    deleteTimeEntry: async (timeEntryId) => await _innerFetch('DELETE', `/entry/${timeEntryId}`),
    getTimeEntryHistory: async (id) => await _innerFetch('GET', `/entry/${id}/history`),
    postStartTimer: async () => await _innerFetch('POST', '/entry/start-timer'),
    postStopTimer: async (timeEntryId) => await _innerFetch('POST', `/entry/stop-timer/${timeEntryId}`),
    getCheckTimer: async () => await _innerFetch('GET', '/entry/check-timer'),
    postCancelTimer: async () => await _innerFetch('POST', '/entry/cancel-timer'),
    postSaveEntry: async (body) => await _innerFetch('POST', '/entry/save', JSON.stringify(body)),

    /*********TIME OFF********/
    getTimeOffEntries: async () => await _innerFetch('GET', '/time-off'),
    getTimeOffEntry: async (id) => await _innerFetch('GET', `/time-off/${id}`),
    getTimeOffTypes: async () => await _innerFetch('GET', '/time-off/types'),
    putTimeOffCloseRequest: async (id) => await _innerFetch('PUT', `/time-off/${id}/close-request`),
    postTimeOffSave: async (body) => await _innerFetch('POST', `/time-off/save`, JSON.stringify(body)),
    getTimeOffHistory: async (id) => await _innerFetch('GET', `/time-off/${id}/history`),

    /*********HISTORY********/
    getHistory: async (from, to) => await _innerFetch('GET', `/history`, JSON.stringify({ from, to })),
}

export default Requests;


async function _innerFetch(method, url, body) {
    let res = null;
    try {
        const response = await fetch(Config.API_HOST + url, {
            method: method,
            body: body,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'token': Config.API_JWT
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