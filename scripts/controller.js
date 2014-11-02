/**
 * Created by Michael on 15/10/2014.
 */

game.init(function() {
    console.log('game loaded');
    music.load('https://soundcloud.com/user5948592/l-v-beethoven-symphonie-n-7-4', function() {
    //music.load('https://soundcloud.com/chill-trap-united/eill-dwly-chill-trap-united-exclusive', function() {
        console.log('music loaded');
    });
    visualizer.setElement(document.querySelector('.visualizer'));
});



document.addEventListener('keydown', function(e) {
    var keyCode = e.which;
    if (keyCode === 32) {
        if (!game.isStarted()) {
            game.start();
            music.play();
            visualizer.start(music);
            document.querySelector('.title-screen-container').classList.add('hidden');
        }
    }
    if (keyCode === 80) {
        if (game.isPaused()) {
            game.resume();
            music.resume();
        } else {
            game.pause();
            music.pause();
        }
    }
});