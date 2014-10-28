function Announcer(el) {
    var self = this;
    self.container = el;
    self.showMessage = function(message) {

        setTitle(message.title);
        setSubtitle(message.subtitle);
        self.container.classList.add('visible');

        setTimeout(function() {
            self.container.classList.remove('visible');
        }, 2000);
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
            announcer.showMessage(event.data);
        }
        
        firepowerContainer.style.width = (firepower * 30) + 'px';
        score.innerHTML = Math.round(newScore);
    };

    module.updateLives = function(livesRemaining) {
        var i, totalLives = 3;

        if (livesRemaining < totalLives) {
            for (i = totalLives; i > livesRemaining; i--) {
                livesContainer.children[i-1].classList.add('hidden');
            }
        }
    };

    return module;
})();