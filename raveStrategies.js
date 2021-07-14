// helper functions
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
function randomSample(array, size) {
    var shuffled = array.slice(0), i = array.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

// overwrite / add values from 'b' to 'a' without modifying originals
function merge(a, b) {
    let merged = {};
    Object.keys(a).forEach(k => merged[k] = a[k]);
    Object.keys(b).forEach(k => {
        var bVal = b[k];
        if(bVal) 
            merged[k] = bVal;
    });
    return to;
}

function getStorageKeys(defaults) {
    return Object.keys(defaults).map(k => "rs-" + k);
}

function saveUserData(data) {
    Object.keys(data).map(k => ["rs-" + k, data[k]]).forEach(kvp => {
        localStorage.setItem(kvp[0], kvp[1]);
    });
}

function loadUserData(defaults) {
    const storageKeys = getStorageKeys(defaults);
    const savedValues = storageKeys.map(sk => {
        var lsValue = localStorage.getItem(sk);
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

// TODO - replace fetch of default data with function that gets user's saved values (if present)
fetch('./defaultData.json')
.then(resp => resp.json())
.then(loadUserData)
.then(data => {
    const dataKeys = Object.keys(data);
    console.log(data, dataKeys);

    // GENERATE A TRACK TEMPO
    var bpmRange = data['bpm']
    const bpm = randomInt(bpmRange[0], bpmRange[1]);

    // WEIGHTED PROBABILITY FOR SONG LENGTH
    // 1:00 => 10%, 2:00 => 20%, 3:00 => 40%, 4:00 => 20%, 5:00 => 10%
    const length = ['1:00', '2:00', '2:00', '3:00', '3:00', '3:00', '3:00', '4:00', '4:00', '5:00']

    const genre = randomChoice(data['genres']);
    const pitchList = data['pitches'];
    const keyList = data['keys'];
    const pitchListIndex = randomInt(0, pitchList.length);

    const key = keyList[pitchListIndex];
    const pitches = pitchList[pitchListIndex];

    const systemList = data['systemList'];
    const actionList = data['actionList']; 
    const thingList = data['thingList']; 
    const contextList = data['contextList']; 

    /*
    WEIGHTED PROBABILITY FOR SYSTEM SELECTION,
    BASED ON # OF ITEMS IN EACH SYSTEM LIST
    (THE MORE GEAR IN A SYSTEM, THE HIGHER THE WEIGHTING)
    SYSTEM 0 : BIG RIG (CIRKLON OR NERDSEQ OR TELETYPE)
    SYSTEM 1 : MIDI DEVICES (CIRKLON OR NERDSEQ)
    SYSTEM 2 : SOUND TOYS (NO SEQUENCER)
    SYSTEM 3 : STANDALONE (NO SEQUENCER)
    SYSTEM 4 : HIGH LEVEL (CIRKLON OR NERDSEQ OR TELETYPE OR NO SEQUENCER)
    */
    var itemCount = 0;
    for (let i = 0; i < systemList.length; i++) {
        itemCount += systemList[i].length;
    }
    var systemWeights = new Array(itemCount);
    var weightsIndex = 0;
    for (let i = 0; i < systemList.length; i++) {
        const subList = systemList[i];
        for (let s = 0; s < subList.length; s++) {
            systemWeights[weightsIndex] = i;
            weightsIndex++;
        }
    }

    const systemSelection = randomChoice(systemWeights);
    const sounds = randomSample(systemList[systemSelection], randomInt(1, 3));

    const sequencerList = data['sequencerList'];
    var sequencerPrepend = '';
    var sequencer = randomChoice(sequencerList[systemSelection]);

    /*
    TODO - this is specific to the original gear, 
    a fully generic version should delete or have generic compatability checks

    IF SYSTEM 0 BIG RIG IS SELECTED, CHECK IF 
    THERE ARE ANY MIDI DEVICES IN SOUND SOURCES
    IF THERE ARE AND THE SEQUENCER IS TELETYPE,
    RANDOMLY RESELECT SEQUENCER FROM SYSTEM 1 SEQUENCER OPTIONS
    */
    if(systemSelection === 0) {
        let check = systemList[1].some((e) => sounds.includes(e));
        if(check && sequencer === 'Teletype')
            sequencer = randomChoice(sequencerList[1]);
    }

    // IF NO SEQUENCER IS SELECTED, DO NOT LIST IT IN THE FULL PRINTOUT OF THE RAVE STRATEGY
    if(sequencer === 'none')
        sequencer = '';
    else
        sequencerPrepend = ' sequenced by '

    // ASSEMBLE THE RAVE STRATEGY
    const raveStrategy = 'Write a ' +
                            bpm + 'bpm ' + 
                            genre + ' track in ' + key + 
                            ' using ' + sounds.join(' / ') + 
                            sequencerPrepend + sequencer + 
                            ' with a duration of ~' + randomChoice(length) + '.'; 
                            
    const description = 'It should ' + randomChoice(actionList) + 
                        ' like ' + randomChoice(thingList) + ' ' + 
                        randomChoice(contextList) + '.';

    const pitchesStr = 'pitches: ' + pitches;

    // unlike original, we're not going to email but instead display in HTML
    document.getElementById('strategy').textContent = raveStrategy;
    document.getElementById('description').textContent = description;
    document.getElementById('pitches').textContent = pitchesStr;
});
