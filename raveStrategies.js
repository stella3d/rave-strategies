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

// TODO - replace fetch of default data with function that gets user's saved values (if present)
loadStrategyInputData(false)
.then(data => {
    const dataKeys = Object.keys(data);

    // GENERATE A TRACK TEMPO
    var bpmRange = data['bpm']
    const bpm = randomInt(bpmRange.min, bpmRange.max);

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
                            ', using ' + sounds.join(' / ') + 
                            sequencerPrepend + sequencer + 
                            ', with a duration of ~' + randomChoice(length) + '.'; 
                            
    const description = 'It should ' + randomChoice(actionList) + 
                        ' like ' + randomChoice(thingList) + ' ' + 
                        randomChoice(contextList) + '.';

    const pitchesStr = 'pitches: ' + pitches;

    // unlike original, we're not going to email but instead display in HTML
    document.getElementById('strategy').textContent = raveStrategy;
    document.getElementById('description').textContent = description;
    document.getElementById('pitches').textContent = pitchesStr;
});
