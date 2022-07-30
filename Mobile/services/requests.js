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

export const postNewEntry = async (body) => {
    return await _innerFetch('POST', '/entry', JSON.stringify(body));
}

export const putUpdateEntry = async (timeEntryId, body) => {
    return await _innerFetch('PUT', `/entry/${timeEntryId}`, JSON.stringify(body));
}

export const getTimeOffEntries = async () => {
    return await _innerFetch('GET', '/time-off');
}

export const getTimeOffEntry = async (id) => {
    return await _innerFetch('GET', `/time-off/${id}`);
}

export const getTimeOffTypes = async () => {
    return await _innerFetch('GET', '/time-off/types');
}

export const putTimeOffCloseRequest = async (id) => {
    return await _innerFetch('PUT', `/time-off/${id}/close-request`);
}


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