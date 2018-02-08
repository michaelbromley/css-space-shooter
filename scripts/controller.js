/**
 * Created by Michael on 15/10/2014.
 */

init();

function init() {


    game.init(function () {

        console.log('game loaded');
        music.load('./assets/sfx/music.mp3', function () {
            document.querySelector('.loader').classList.add('hidden');
            registerEventHandlers();
        });
        visualizer.setElement(document.querySelector('.visualizer'));
    });

    game.onCompleted(function () {
        document.querySelector('.game-over-container').classList.remove('hidden');
        document.querySelector('.game-won').classList.remove('hidden');
        fillInScoreCard();
    });

    game.onDied(function () {
        document.querySelector('.game-over-container').classList.remove('hidden');
        document.querySelector('.game-lost').classList.remove('hidden');
        fillInScoreCard();
    });
}

function fillInScoreCard() {
    var data = game.getScoreCardInfo();

    var bestScore = localStorage['bestScore'];
    var bestStage = localStorage['bestStage'];

    if (typeof bestScore === 'undefined' || parseInt(bestScore.replace(',',''), 10) < parseInt(data.score.replace(',',''), 10)) {
            document.querySelector('.new-record.score').style.display = 'inline';
            localStorage['bestScore'] = bestScore = data.score;
    }
    if (typeof bestStage === 'undefined' || bestStage < data.stage) {
            document.querySelector('.new-record.stage').style.display = 'inline';
            localStorage['bestStage'] = bestStage = data.stage;
    }

    document.querySelector('.stage-reached').innerText = data.stage;
    document.querySelector('.best-stage').innerText = bestStage || data.stage;
    document.querySelector('.score-achieved').innerText = data.score;
    document.querySelector('.best-score').innerText = bestScore || data.score;
}


function registerEventHandlers() {
    document.addEventListener('keydown', function (e) {
        var keyCode = e.which;
        if (keyCode === 32) {
            if (game.state() === 'initialized') {
                document.querySelector('.browser-warning').style.display = 'none';
                game.start();
                music.play();
                visualizer.start(music);
                document.querySelector('.title-screen-container').classList.add('hidden');
            }
        }
        if (keyCode === 80) {
            if (game.state() === 'paused') {
                game.resume();
                music.resume();
            } else {
                game.pause();
                music.pause();
            }
        }
        if (keyCode === 82) {
            if (game.state() === 'won' || game.state() === 'lost') {
                document.location.reload();
            }
        }
    });

    var instructionsDiv = document.querySelector('.instructions');
    var aboutDiv = document.querySelector('.about');

    instructionsDiv.querySelector('.open-instructions').addEventListener('click', function(e) {
        instructionsDiv.classList.add('display');
        e.preventDefault();
    });
    instructionsDiv.querySelector('.close-instructions').addEventListener('click', function(e) {
        instructionsDiv.classList.remove('display');
        e.preventDefault();
    });
    aboutDiv.querySelector('.open-about').addEventListener('click', function(e) {
        aboutDiv.classList.add('display');
        e.preventDefault();
    });
    aboutDiv.querySelector('.close-about').addEventListener('click', function(e) {
        aboutDiv.classList.remove('display');
        e.preventDefault();
    });
}