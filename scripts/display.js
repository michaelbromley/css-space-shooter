function Announcer(el) {
    var self = this;
    self.container = el;
    self.showMessage = function(message, autoHide) {

        autoHide = autoHide || false;

        setTitle(message.title);
        setSubtitle(message.subtitle);
        self.container.classList.add('visible');

        if (autoHide) {
            setTimeout(function () {
                self.hideMessage();
            }, 2000);
        }
    };

    self.hideMessage = function() {
        self.container.classList.remove('visible');
    };

    function setTitle(title) {
        self.container.querySelector('.title').innerHTML = (typeof title === 'undefined') ? '' : title;
    }

    function setSubtitle(subtitle) {
        self.container.querySelector('.subtitle').innerHTML = (typeof subtitle === 'undefined') ? '' : subtitle;
    }
}


var display = (function() {
    var module = {};
    var announcer, firepowerContainer, score, livesContainer;

    module.setAnnouncerElement = function(el) {
        announcer = new Announcer(el);
    };

    module.setFirepowerElement = function(el) {
        firepowerContainer = el;
    };

    module.setScoreElement = function(el) {
        score = el;
    };

    module.setLivesElement = function(el) {
        livesContainer = el;
    };

    module.hideAll = function() {
        firepowerContainer.classList.add('hidden');
        score.parentElement.classList.add('hidden');
        livesContainer.classList.add('hidden');
    };

    module.showAll = function() {
        firepowerContainer.classList.remove('hidden');
        score.parentElement.classList.remove('hidden');
        livesContainer.classList.remove('hidden');
    };

    module.update = function(event, firepower, newScore) {
        if (event.type && event.type === 'announcement') {
            announcer.showMessage(event.data, true);
        }

        firepowerContainer.style.width = (firepower * 30) + 'px';
        score.innerHTML = Math.round(newScore).toLocaleString();
    };

    module.showPausedMessage = function() {
        announcer.showMessage({ title: 'Paused', subtitle: 'Press "p" to resume'});
    };

    module.hidePausedMessage = function() {
        announcer.hideMessage();
    };

    module.updateLives = function(livesRemaining) {
        var i, totalLives = 3;

        for (i = totalLives; i > 0; i--) {
            if (i <= livesRemaining) {
                livesContainer.children[i-1].classList.remove('hidden');
            } else {
                livesContainer.children[i - 1].classList.add('hidden');
            }
        }
    };

    return module;
})();