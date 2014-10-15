/**
 * Created by Michael on 15/10/2014.
 */

init();



document.addEventListener('keydown', function(e) {
    var keyCode = e.which;
    if (keyCode === 32) {
        if (!gameStarted) {
            start();
            document.querySelector('.title-screen-container').classList.add('hidden');
        }
    }
});