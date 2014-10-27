function Track(el) {
    var self = this;
    self.container = el;

    [].forEach.call(self.container.querySelectorAll('.track'), function(track) {
        track.style.webkitAnimationPlayState = 'paused';
    });

    this.show = function() {
        [].forEach.call(self.container.querySelectorAll('.track'), function(track) {
            track.style.webkitAnimationPlayState = 'running';
        });
    };

    this.update = function(ship) {
        var x = ship.x * -0.3;
        var y = ship.y * -0.3;
        self.container.style.transform = "translateX(" + x + 'px) translateY(' + y + 'px)';
    }
}