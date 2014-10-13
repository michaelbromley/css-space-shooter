/**
 * Created by Michael on 08/10/2014.
 */

/**
 * Reads the levelData array and emits any events that occur at a given timestamp
 */
var levelPlayer = (function() {
    var module = {};
    var startTime, levelData, secondsElapsed;

    module.setLevel = function(level) {
        levelData = level;
    };

    module.getEvents = function(timestamp) {
        if (typeof startTime === 'undefined') {
            startTime = timestamp;
        }

        secondsElapsed = getSecondsElapsed(startTime, timestamp);
        return getEventAtTime(secondsElapsed, levelData);
    };

    function getSecondsElapsed(startTime, timestamp) {
        return Math.floor((timestamp - startTime) / 1000);
    }

    function getEventAtTime(secondsElapsed, levelData) {
        var totalDuration = 0;
        var l = 0;
        var eventObject = [];

        while (totalDuration + levelData[l].duration < secondsElapsed && l < levelData.length - 1) {
            l++;
            totalDuration += levelData[l].duration;
        }

        var level = levelData[l];
        for (var e = 0; e < level.events.length; e++) {
            var event = level.events[e];

            if (event.time + totalDuration === secondsElapsed) {
                if (!event.fired) {
                    event.fired = true;
                    eventObject = event;
                    break;
                }
            }
        }

        return eventObject;
    }

    return module;
})();

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
        duration: 15,
        events: [
            { time: 0, type: 'spawn', data: [ALIEN_CLASS.horizontal, ALIEN_CLASS.vertical, ALIEN_CLASS.random] },
            { time: 1, type: 'announcement', data: ['Stage 1'] },
            { time: 4, type: 'spawn', data: [ALIEN_CLASS.stationary, ALIEN_CLASS.stationary] },
        ]
    },
    {
        duration: 15,
        events: [
            { time: 1, type: 'announcement', data: ['Stage 2'] },
            { time: 3, type: 'spawn', data: [ALIEN_CLASS.vertical] },
            { time: 4, type: 'spawn', data: [ALIEN_CLASS.horizontal] },
            { time: 6, type: 'spawn', data: [ALIEN_CLASS.vertical, ALIEN_CLASS.horizontal] }
        ]
    },
    {
        duration: 20,
        events: [
            { time: 1, type: 'announcement', data: ['Stage 3'] },
            { time: 3, type: 'spawn', data: [ALIEN_CLASS.spiral] },
            { time: 4, type: 'spawn', data: [ALIEN_CLASS.horizontal] },
            { time: 5, type: 'spawn', data: [ALIEN_CLASS.vertical] },
            { time: 6, type: 'spawn', data: [ALIEN_CLASS.horizontal, ALIEN_CLASS.spiral, ALIEN_CLASS.vertical] }
        ]
    }
];