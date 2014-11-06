var visualizer = (function() {
    var module = {};
    var highsEl, lowsEl;

    module.setElement = function(el) {
        highsEl = el.querySelector('.highs');
        lowsEl = el.querySelector('.lows');

        highsEl.style.opacity = 0;
        lowsEl.style.opacity = 0;
    };

    module.start = function(audioSource) {

        function tick() {

            var frequencyData = audioSource.getAudioData().frequencyData;

            var lows = getAverageValueInRange(frequencyData, 0, 15) / 255;
            var highs = getAverageValueInRange(frequencyData, 16, 25) / 255;

            lowsEl.style.opacity = lows;
            highsEl.style.opacity = highs;

            setTimeout(tick, 300);
        }

        tick();
    };

    function getAverageValueInRange(frequencyData, start, end) {
        var sum = 0;

        for (var i = start; i <= end; i ++) {
            sum += frequencyData[i];
        }

        return sum / (end - start);
    }

    return module;
})();