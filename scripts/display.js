function Announcer(el) {
    var self = this;
    self.container = el;
    self.showMessage = function(message) {
        self.container.innerHTML = message;
        self.container.style.opacity = 0.8;

        setTimeout(function() {
            self.container.style.opacity = 0;
        }, 2000);
    };
}


var display = (function() {
    var module = {};
    var announcer, firepowerContainer, score;

    module.setAnnouncerElement = function(el) {
        announcer = new Announcer(el);
    };

    module.setFirepowerElement = function(el) {
        firepowerContainer = el;
    };

    module.setScoreElement = function(el) {
        score = el;
    };

    module.update = function(event, firepower, newScore) {
        if (event.type && event.type === 'announcement') {
            announcer.showMessage(event.data);
        }
        firepowerContainer.style.width = (firepower * 30) + 'px';
        score.innerHTML = Math.round(newScore);
    };

    return module;
})();