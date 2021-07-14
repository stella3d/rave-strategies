// overwrite / add values from 'b' to 'a' without modifying originals
function merge(a, b) {
    let merged = {};
    Object.keys(a).forEach(k => merged[k] = a[k]);
    Object.keys(b).forEach(k => {
        var bVal = b[k];
        if(bVal) 
            merged[k] = bVal;
    });
    return merged;
}

function getStorageKeys(defaults) {
    return Object.keys(defaults).map(k => "rs-" + k);
}

function saveUserData(data) {
    Object.keys(data).map(k => ["rs-" + k, JSON.stringify(data[k])])
    .forEach(kvp => {
        //console.log('saving to local storage, key: ' + kvp[0], kvp[1]);
        localStorage.setItem(kvp[0], kvp[1]);
    });
}

function loadUserData(defaults) {
    const storageKeys = getStorageKeys(defaults);
    const savedValues = storageKeys.map(sk => {
        var lsValue = localStorage.getItem(sk);
        //console.log('loaded from localStorage: ', lsValue);
        var ogKey = sk.slice(3); // remove 'rs-'
        return lsValue ? [ogKey, JSON.parse(lsValue)] : null;
    });

    let data = {};
    savedValues.forEach(v => {
        if(v === null) return;
        const key = v[0];
        data[key] = v[1];
    });

    return merge(defaults, data);
}

function loadStrategyInputData() {
    return fetch('./defaultData.json')
            .then(resp => resp.json())
            .then(loadUserData)
}