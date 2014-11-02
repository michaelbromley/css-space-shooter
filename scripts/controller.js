/**
 * Created by Michael on 15/10/2014.
 */

init();



document.addEventListener('keydown', function(e) {
    var keyCode = e.which;
    if (keyCode === 32) {
        if (!gameStarted) {
            start();
            playMusic('https://soundcloud.com/user5948592/l-v-beethoven-symphonie-n-7-4');
            document.querySelector('.title-screen-container').classList.add('hidden');
        }
    }
});