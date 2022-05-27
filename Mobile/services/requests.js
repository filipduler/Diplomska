import Config from 'react-native-config'

export const getTimeEntries = async (month, year) => {
    return await _innerFetch('GET', `/entry/${year}/${month}`);
}

export const deleteTimeEntry = async (timeEntryId) => {
    return await _innerFetch('DELETE', `/entry/${timeEntryId}`);
}

export const postStartTimer = async () => {
    return await _innerFetch('POST', '/entry/start-timer');
}

export const postStopTimer = async (timeEntryId) => {
    return await _innerFetch('POST', `/entry/stop-timer/${timeEntryId}`);
}

export const getCheckTimer = async () => {
    return await _innerFetch('GET', '/entry/check-timer');
}

export const postCancelTimer = async () => {
    return await _innerFetch('POST', '/entry/cancel-timer');
}

async function _innerFetch(method, url) {
    let res = null;
    try {
        const response = await fetch(Config.API_HOST + url, {
            method: method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
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