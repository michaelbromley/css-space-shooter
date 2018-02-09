# CSS Space Shooter

![Screen shot](https://raw.githubusercontent.com/michaelbromley/css-space-shooter/master/assets/images/screenshot-02.jpg "Screen shot")

## [Play The Game](https://www.michaelbromley.co.uk/experiments/css-space-shooter/)

This is an experiment I made to investigate the capabilities of CSS 3D transforms.
Having played about with this technology a little (see [this](https://www.michaelbromley.co.uk/experiments/css-3d-butterfly/) or [this](http://www.michaelbromley.co.uk/horizonal/demo/),
and having seen some very impressive demos ([CSS FPS](http://www.keithclark.co.uk/labs/css-fps/), [CSS X-Wing](http://codepen.io/juliangarnier/details/hzDAF),
I wanted to explore the idea of making a simple 3D game with only DOM and CSS.

## Everything in CSS? Cool!

[CSS transforms](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transforms) allow us to position and rotate DOM elements in 3D space. The big advantage of this over, say, using canvas or webGL is that we do not need to
worry about any of the complex maths involved in projecting a 3D object onto the screen. The browser's rendering engine (with the help of your GPU) will take care of all
that. You just need to specify the x, y, z coordinates as well as the rotation along any axis. This makes it really simple to map your JavaScript objects onto the
screen, by just keeping track of these simple coordinate and rotation values.

Having [previously played with pseudo-3D in canvas](https://www.michaelbromley.co.uk/experiments/soundcloud-vis/#muse/undisclosed-desires), I have some idea
of the massive amount of calculation involved in plotting all the lines and vertices of each
object manually. In this regard, the simple, declarative nature of CSS allows some really powerful 3D effects with astonishingly little code.

## ...or not so cool.

That convenience comes at a cost, however. For one, in CSS it is really really hard to create any shape other than a rectangle or an ellipse. Triangles, for example, are
only possible through [dirty hacks with the border property](http://davidwalsh.name/css-triangles).

Secondly, performance. Despite hardware acceleration for these 3D transforms, I quickly ran into performance issues when scaling up the number of objects
 interacting on screen simultaneously. Certain CSS operations are also *very* expensive, such as transitioning box-shadow values or gradient backgrounds.

I'm sure my code can be optimized and this performance ceiling can be raised considerably. However, I wouldn't recommend using CSS and DOM for a serious 3D game.

## Browser Compatibility

* Right now this works properly in the latest version of Chrome.
* In my tests with Firefox it is very jerky and then usually grinds to a complete halt after a minute or so.
* Internet Explorer has a couple of fatal issues - it does not yet support a key CSS property - [`transform-style: preserve3d`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style#Browser_compatibility) -
which is essential to this method of building up 3D objects and 3D scenes which all share the same perspective. Additionally, IE does not currently support the
Web Audio API, which I use for the sound effects and music. The game currently won't even load for this latter reason.
* I've not tested in any other browsers, but feedback is welcome.

## Credits

### Inspiration and implementation details:

* [Keith Clark](http://www.keithclark.co.uk/) - seriously, check out his stuff. It's amazing. Used his advice on positioning the DOM elements in the center of the viewport and moving them only
with transforms, which works well.
* html5Rocks - Some really helpful tutorials [here](http://www.html5rocks.com/en/tutorials/webaudio/games/) and [here](http://www.html5rocks.com/en/tutorials/webaudio/intro/)
 on how to use the Web Audio API.
* Dive Into HTML5 [article on the localStorage API](http://diveintohtml5.info/storage.html), which I use to store high scores.

### Sound effects

I got all my sounds effects from https://www.freesound.org.

* gun: https://www.freesound.org/people/afirlam/sounds/236939/
* explosion: https://www.freesound.org/people/plamdi1/sounds/95058/
* alien noise: https://www.freesound.org/people/mensageirocs/sounds/234442/
* alien drone: https://www.freesound.org/people/klankbeeld/sounds/243702/
* 1-down: https://www.freesound.org/people/leviclaassen/sounds/107789/

### Music

Ludwig van Beethoven - Symphony No.7 in A major op.92 - II, Allegretto


## Developing

```
npm install
npm run watch // dev mode 
npm run compile // production build
```

## License

MIT