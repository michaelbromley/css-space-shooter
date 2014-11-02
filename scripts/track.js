function Track(el) {
    var self = this;
    self.container = el;

    this.start = function () {
        [].forEach.call(self.container.querySelectorAll('.track'), function(track) {
            track.style.webkitAnimationPlayState = 'running';
            track.style.animationPlayState = 'running';
        });
    };

    this.stop = function() {
        [].forEach.call(self.container.querySelectorAll('.track'), function(track) {
            track.style.webkitAnimationPlayState = 'paused';
            track.style.animationPlayState = 'paused';
        });
    };

    this.update = function(ship) {
        var x = ship.x * -0.3;
        var y = ship.y * -0.3;
        self.container.style.transform = "translateX(" + x + 'px) translateY(' + y + 'px)';
    };

    this.stop();
}