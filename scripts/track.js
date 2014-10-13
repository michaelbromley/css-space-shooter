function Track(el) {
    this.container = el;

    this.update = function(ship) {
        var x = ship.x * -0.3;
        var y = ship.y * -0.3;
        this.container.style.transform = "translateX(" + x + 'px) translateY(' + y + 'px)';
    }
}