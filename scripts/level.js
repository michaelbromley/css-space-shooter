/**
 * Created by Michael on 08/10/2014.
 */

/**
 * Reads the levelData array and emits any events that occur at a given timestamp
 */
var levelPlayer = (function() {
    var module = {};
    var startTime, levelData, secondsElapsed, activeAliens = 0, currentStageIndex = 0;

    module.setLevel = function(level) {
        levelData = level;
    };

    module.getEvents = function(timestamp) {
        var currentStage;

        if (typeof startTime === 'undefined') {
            startTime = timestamp;
        }

        currentStage = getCurrentStage();
        secondsElapsed = getSecondsElapsed(startTime, timestamp);
        return getEventAtTime(secondsElapsed, currentStage);
    };

    module.alienRemoved = function() {
        activeAliens = Math.max(activeAliens - 1, 0);
        console.log('activeAliens: ' + activeAliens);
    };

    function getSecondsElapsed(startTime, timestamp) {
        return Math.floor((timestamp - startTime) / 1000);
    }

    function getCurrentStage(timestamp) {
        if (allStageEventsFired() && activeAliens === 0) {
            currentStageIndex ++;
            activeAliens = 0;
            startTime = timestamp;
            console.log('Start stage ' + (currentStageIndex + 1));
        }
        return levelData[currentStageIndex];
    }

    function allStageEventsFired() {
        var stageEvents = levelData[currentStageIndex].events;
        return stageEvents[stageEvents.length - 1].fired === true;
    }

    function getEventAtTime(secondsElapsed, currentStage) {
        var e, event;

        for (e = 0; e < currentStage.events.length; e++) {
            event = currentStage.events[e];

            if (event.time === secondsElapsed) {
                if (!event.fired) {
                    event.fired = true;
                    setActiveAliens(event);
                    return event;
                }
            }
        }

        return [];
    }

    function setActiveAliens(event) {
        if (event.type === 'spawn') {
            activeAliens += event.data.length;
            console.log('activeAliens: ' + activeAliens);
        }
    }

    return module;
})();

/**
 * An "enum" of the different types of alien
 *
 * @type {{stationary: number, vertical: number, horizontal: number, spiral: number, random: number}}
 */
var ALIEN_CLASS = {
    stationary: 1,
    vertical: 2,
    horizontal: 3,
    spiral: 4,
    random: 5
};

/**
 * This array describes the game level structure.
 *
 * @type {{name: string, duration: number, sequence: {time: number, spawn: *[]}[]}[]}
 */
var levelData = [
    {
        events: [
            { time: 0, type: 'spawn', data: [ALIEN_CLASS.horizontal, ALIEN_CLASS.vertical, ALIEN_CLASS.random] },
            { time: 1, type: 'announcement', data: ['Stage 1'] },
            { time: 4, type: 'spawn', data: [ALIEN_CLASS.stationary, ALIEN_CLASS.stationary] }
        ]
    },
    {
        events: [
            { time: 1, type: 'announcement', data: ['Stage 2'] },
            { time: 3, type: 'spawn', data: [ALIEN_CLASS.vertical] },
            { time: 4, type: 'spawn', data: [ALIEN_CLASS.horizontal] },
            { time: 6, type: 'spawn', data: [ALIEN_CLASS.vertical, ALIEN_CLASS.horizontal] }
        ]
    },
    {
        events: [
            { time: 1, type: 'announcement', data: ['Stage 3'] },
            { time: 3, type: 'spawn', data: [ALIEN_CLASS.spiral] },
            { time: 4, type: 'spawn', data: [ALIEN_CLASS.horizontal] },
            { time: 5, type: 'spawn', data: [ALIEN_CLASS.vertical] },
            { time: 6, type: 'spawn', data: [ALIEN_CLASS.horizontal, ALIEN_CLASS.spiral, ALIEN_CLASS.vertical] }
        ]
    }
];