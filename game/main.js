/**
 * game/main.js
 * 
 * What it Does:
 *   This file is the main game class
 *   Important parts are the load, create, and play functions
 *   
 *   Load: is where images, sounds, and fonts are loaded
 *   
 *   Create: is where game elements and characters are created
 *   
 *   Play: is where game characters are updated according to game play
 *   before drawing a new frame to the screen, and calling play again
 *   this creates an animation just like the pages of a flip book
 * 
 *   Other parts include boilerplate for requesting and canceling new frames
 *   handling input events, pausing, muting, etc.
 * 
 * What to Change:
 *   Most things to change will be in the play function
 */

import Koji from 'koji-tools';

import {
    requestAnimationFrame,
    cancelAnimationFrame
} from './helpers/animationFrame.js';

import {
    loadList,
    loadImage,
    loadSound,
    loadFont
} from './helpers/assetLoaders.js';

import {
    hashCode,
    randomProperty,
} from './utils/baseUtils.js';

import {
    resize
} from './utils/imageUtils.js';

import {
    getDistance
} from './utils/spriteUtils.js';

import {
    canvasInputPosition
} from './utils/inputUtils.js'

import {
    Spark,
    Burn
} from './objects/effects.js';

import audioContext from 'audio-context';
import audioPlayback from 'audio-play';

import Button from './characters/button.js';

class Game {

    constructor(canvas, overlay, topbar, config) {
        this.config = config; // customization
        this.overlay = overlay;
        this.topbar = topbar;
        this.topbar.active = config.settings.gameTopBar;
        this.maxWidth = parseInt(config.settings.maxWidth);

        this.prefix = hashCode(this.config.settings.name); // set prefix for local-storage keys

        this.canvas = canvas; // game screen
        this.ctx = canvas.getContext("2d"); // game screen context

        this.audioCtx = audioContext();

        // setup event listeners
        // handle keyboard events
        document.addEventListener('keydown', ({ code }) => this.handleKeyboardInput('keydown', code));
        document.addEventListener('keyup', ({ code }) => this.handleKeyboardInput('keyup', code));

        // handle taps
        document.addEventListener('touchstart', (e) => this.handleTap(e));

        // handle overlay clicks
        this.overlay.root.addEventListener('click', (e) => this.handleClicks(e));

        // handle resize events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener("orientationchange", (e) => this.handleResize(e));

        // restart game loop after tab unfocused
        // window.addEventListener('blur', () => this.requestFrame(() => this.play()));

        // handle koji config changes
        Koji.on('change', (scope, key, value) => {
            this.config[scope][key] = value;
            this.cancelFrame(this.frame.count - 1);
            this.load();
        });

    }

    init() {
        // set canvas
        // this.canvas.width = window.innerWidth; // set game screen width
        this.canvas.width = Math.min(window.innerWidth, this.maxWidth); // set game screen width
        this.canvas.height = this.topbar.active ? window.innerHeight - this.topbar.clientHeight : window.innerHeight; // set game screen height

        // frame count, rate, and time
        // this is just a place to keep track of frame rate (not set it)
        this.frame = {
            count: 0,
            time: Date.now(),
            rate: null,
            scale: null
        };

        // create neat place to keep buttons
        this.buttons = this.config['@@editor']
            .find(c => c.key === 'buttons').fields
            .map(f => {
                return {
                    key: f.key,
                    value: this.config.buttons[f.key],
                    type: f.type
                }
            })
            .reduce((acc, cur) => {
                let key = cur.key.replace(/Key|Image/, '');

                // allocate key
                if (acc[key] === undefined) { acc[key] = {}; }

                // set keycode
                if (cur.type === 'text') {
                    acc[key].keycode = {
                        key: cur.key,
                        value: cur.value
                    };
                }

                // set image
                if (cur.type === 'image') {
                    acc[key].image = {
                        key: cur.key,
                        value: cur.value
                    };

                }

                // set lanes
                acc[key].lane = Object.keys(acc).length - 1;

                return acc;
            }, {});

        let lanes = Object.keys(this.buttons).length;

        // game settings
        this.state = {
            current: 'loading',
            prev: '',
            lanes: lanes,
            laneSize: Math.floor(this.canvas.width / lanes),
            gameSpeed: parseInt(this.config.settings.gameSpeed),
            score: 0,
            power: 100,
            paused: false,
            muted: localStorage.getItem(this.prefix.concat('muted')) === 'true',
            keyMap: ''
        };

        this.input = {
            active: 'keyboard',
            keyboard: { up: false, right: false, left: false, down: false },
            mouse: { x: 0, y: 0, click: false },
            touch: { x: 0, y: 0 },
        };

        this.images = {}; // place to keep images
        this.sounds = {}; // place to keep sounds
        this.fonts = {}; // place to keep fonts

        this.effects = []; // effects
        this.entities = []; // entities
        this.goals = [] // goals

        // set topbar and topbar color
        this.topbar.active = this.config.settings.gameTopBar;
        this.topbar.style.display = this.topbar.active ? 'block' : 'none';
        this.topbar.style.backgroundColor = this.config.colors.primaryColor;


        // set screen
        this.screen = {
            top: 0,
            bottom: this.canvas.height,
            left: 0,
            right: this.canvas.width,
            centerX: this.canvas.width / 2,
            centerY: this.canvas.height / 2,
            scale: ((this.canvas.width + this.canvas.height) / 2) * 0.003
        };


        // set document body to backgroundColor
        document.body.style.backgroundColor = this.config.colors.backgroundColor;

        // set loading indicator to textColor
        document.querySelector('#loading').style.color = this.config.colors.textColor;

    }

    load() {
        // load pictures, sounds, and fonts

        // pause background music on restart
        if (this.sounds && this.sounds.backgroundMusic) {
            // this.sounds.backgroundMusic.pause();
        }

        this.init();

        // make a list of assets
        const gameAssets = [
            loadImage('backgroundImage', this.config.images.backgroundImage, true),
            loadSound('backgroundMusic', this.config.sounds.backgroundMusic),
            loadSound('successSound', this.config.sounds.successSound),
            loadFont('gameFont', this.config.settings.fontFamily)
        ];

        // make a list of button image assets
        const buttonImages = Object.entries(this.buttons)
            .map(entry => entry[1])
            .map(button => loadImage(button.image.key, button.image.value));

        // put the loaded assets the respective containers
        loadList(
                [...gameAssets, ...buttonImages],
                (progress) => {
                    console.log('progress', progress);
                    this.overlay.setProgress(`${progress.percent}%`);
                })
            .then((assets) => {
                console.log('done', assets);

                // attach assets
                this.images = assets.image;
                this.sounds = assets.sound;

                // create
                this.create();
            })
            .catch(err => console.error(err));
    }

    create() {
        // create game characters

        // set overlay styles
        this.overlay.setStyles({
            ...this.config.colors,
            ...this.config.settings
        });

        // add goals
        this.goals = Object.entries(this.buttons)
            .map(ent => ent[1])
            .map(button => {
                let image = this.images[button.image.key];
                let size = resize({
                    image: image,
                    width: this.state.laneSize * 0.75
                });
                return new Button({
                    goal: true,
                    meta: {
                        lane: button.lane,
                        keycode: button.keycode.value
                    },
                    ctx: this.ctx,
                    image: image,
                    lane: button.lane,
                    x: (button.lane * this.state.laneSize) + (size.width / 8),
                    y: this.screen.bottom - size.height * 1.25,
                    width: size.width,
                    height: size.height,
                    speed: this.state.gameSpeed,
                    bounds: this.screen
                })
            });

        this.setState({
            current: 'ready',
            keyMap: this.goals.map((g) => `
                <div id="desktop-instructions-item">
                    <img 
                        id="desktop-instructions-image"
                        src="${g.image.src}"
                    />
                    <span id="desktop-instructions-span">
                        ${g.meta.keycode.replace(/Digit|Key/, '')}
                    </span>
                </div>
            `)
        });

        this.play();
    }

    play() {
        // update game characters

        // clear the screen of the last picture
        this.ctx.fillStyle = this.config.colors.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // draw and do stuff that you need to do
        // no matter the game state
        this.ctx.drawImage(this.images.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);

        // ready to play
        if (this.state.current === 'ready') {

            // display menu after loading or game over
            if (this.state.prev.match(/loading|over/)) {
                this.overlay.hide('loading');
                this.canvas.style.opacity = 1;

                this.overlay.setBanner(this.config.settings.name);
                this.overlay.setButton(this.config.settings.startText);
                this.overlay.setInstructions({
                    desktop: `
                        <div class="desktop">
                            ${this.config.settings.instructionsDesktop}
                            <div>
                                ${this.state.keyMap.join('')}
                            </div>
                        </div>
                    `,
                    mobile: this.config.settings.instructionsMobile
                });

                this.overlay.setStats({ score: this.state.score, power: this.state.power });

                this.overlay.setMute(this.state.muted);
                this.overlay.setPause(this.state.paused);

                this.setState({ current: 'ready' });
            }

        }

        // game play
        if (this.state.current === 'play') {

            // if last state was 'ready'
            // hide overlay items
            if (this.state.prev === 'ready') {
                this.overlay.hide(['banner', 'button', 'instructions'])

                this.setState({ current: 'play' });
            }

            this.overlay.setStats({ score: this.state.score, power: this.state.power });

            if (!this.state.muted && !this.state.backgroundMusic) {
                let sound = this.sounds.backgroundMusic;
                this.state.backgroundMusic = audioPlayback(sound, {
                    start: 0,
                    end: sound.duration,
                    loop: true,
                    context: this.audioCtx
                });
            }

            // add a button
            if (this.frame.count % 120 === 0 || this.entities.length < 5) {
                // pick a random lane/location
                let button = randomProperty(this.buttons);
                let location = { x: this.state.laneSize * button.lane, y: -200 };

                // ignore crowded locations
                let inValidLocation = this.entities.some((ent) => {
                    return getDistance(ent, location) < this.state.laneSize * 2;
                });

                if (!inValidLocation) {
                    // add new button
                    let image = this.images[button.image.key]
                    let size = resize({ image: image, width: this.state.laneSize * 0.75 });

                    this.entities.push(new Button({
                        meta: { lane: button.lane, keycode: button.keycode.value },
                        ctx: this.ctx,
                        image: image,
                        lane: button.lane,
                        x: (button.lane * this.state.laneSize) + (size.width / 8),
                        y: location.y,
                        width: size.width,
                        height: size.height,
                        speed: this.state.gameSpeed,
                        bounds: this.screen
                    }))
                }
            }

            // update and draw effects
            for (let i = 0; i < this.effects.length; i++) {
                let effect = this.effects[i];

                // run effect tick
                effect.tick(this.frame.count);

                // remove in-active effects
                if (!effect.active) {
                    this.effects.splice(i, 1);
                }

            }


            // update and draw buttons
            for (let i = 0; i < this.entities.length; i++) {
                const button = this.entities[i];

                button.move(0, 1, this.frame.scale);
                button.draw();

                if (button.y > this.screen.bottom) {
                    // remove off-screen buttons
                    this.entities.splice(i, 1);

                    // remove points from powerbar
                    this.setState({
                        power: Math.min(this.state.power - (this.state.power / 50), 100) // remove power
                    })
                }

            }

            // update and draw goals
            for (let i = 0; i < this.goals.length; i++) {
                const goalButton = this.goals[i];

                // draw goal
                goalButton.draw();
            }


            // check for game over
            if (this.state.power < 5) {
                this.setState({ current: 'over' });
            }


        }

        // game over
        if (this.state.current === 'over') {
            // game over code
            this.overlay.setBanner(this.config.settings.gameoverText);

            // update and draw effects
            for (let i = 0; i < this.effects.length; i++) {
                let effect = this.effects[i];

                // run effect tick
                effect.tick();

                // remove in-active effects
                if (!effect.active) {
                    this.effects.splice(i, 1);
                }

            }

            if (!this.effects.length) {
                this.load();
            }

        }

        // draw the next screen
        this.requestFrame(() => this.play());
    }

    // check hit
    checkGoalAttempt(goal) {
        // success when a goal
        // if goal is less than some distance from
        // a button of the same type
        this.entities.forEach((target, index) => {
            // valid target
            let validTarget = target.meta.keycode === goal.meta.keycode;

            // within range
            let threshold = goal.height / 2; // within threshold when within 25%
            let range = Math.abs(goal.y - target.y);
            let withinRange = range < threshold;

            // handle hits
            if (validTarget && withinRange) {

                // remove target
                this.entities.splice(index, 1);

                // add score to powerbar
                let targetScore = Math.abs((range - threshold) / threshold);
                this.setState({
                    score: this.state.score + Math.floor(targetScore * 10), // add score
                    power: Math.min(this.state.power + (targetScore * 25), 100), // add power
                    passStreak: 0, // reset pass streak
                    gameSpeed: this.state.gameSpeed + 0.1 // increase game speed
                })

                // success feedback
                this.animateSuccess(goal);

                // play success sound
                let sound = this.sounds.successSound;
                audioPlayback(sound, {
                    start: 0,
                    end: sound.duration,
                    context: this.audioCtx
                });

            } else {
                // remove points from powerbar
                this.setState({
                    power: Math.min(this.state.power - (this.state.power / 50), 100) // remove power
                })
            }
        });

        // press goal button
        goal.pressed();
    }

    animateSuccess(goal) {

        this.effects.push(
            new Spark({
                ctx: this.ctx,
                n: 25,
                x: [goal.x, goal.x + goal.width],
                y: [goal.y, goal.y + goal.height],
                vx: [-2, 2],
                vy: [-4, -1],
                color: this.config.colors.sparkColor,
                burnRate: 0.01
            }),
            new Burn({
                ctx: this.ctx,
                x: goal.cx,
                y: goal.cy,
                color: this.config.colors.burnColor
            })
        );

    }

    // event listeners
    handleClicks(e) {
        if (this.state.current === 'loading') { return; }

        let { target } = e;

        // mute
        if (target.id === 'mute') {
            this.mute();
        }

        // pause
        if (target.id === 'pause') {
            this.pause();
        }

        // button
        if (target.id === 'button') {
            // if defaulting to have sound on by default
            // double mute() to warmup iphone audio here
            this.mute();
            this.mute();

            this.setState({ current: 'play' });
        }
    }

    handleKeyboardInput(type, code) {
        // check matching goal
        if (type === 'keydown' && this.state.current === 'play') {
            // get goal matching keycode
            let goal = this.goals
                .find(g => g.meta.keycode === code);

            // check goal attempt
            goal && this.checkGoalAttempt(goal);
        }

        // start game on read
        if (type === 'keydown' && this.state.current === 'ready') {
            this.setState({ current: 'play' });
        }

        // reload on game over
        if (type === 'keydown' && this.state.current === 'over') {
            this.effects.length === 1 && this.load();
        }

    }

    handleTap(e) {
        // get location tap
        let location = canvasInputPosition(this.canvas, e.touches[0]);

        // get goal
        let goal = this.goals.find((goal) => {
            let overlapsX = location.x > goal.x && location.x < goal.x + goal.width;
            let overlapsY = location.y > goal.y && location.y < goal.y + goal.width;

            return overlapsX && overlapsY;
        })

        // check
        if (goal) {

            this.checkGoalAttempt(goal);
        }
    }

    handleResize() {

        document.location.reload();
    }

    // pause game
    pause() {
        if (this.state.current != 'play') { return; }

        this.state.paused = !this.state.paused;
        this.overlay.setPause(this.state.paused);

        if (this.state.paused) {
            // pause game loop
            this.cancelFrame(this.frame.count - 1);

            // mute all game sounds
            this.audioCtx.suspend();

            this.overlay.setBanner('Paused');
        } else {
            // resume game loop
            this.requestFrame(() => this.play(), true);

            // resume game sounds if game not muted
            if (!this.state.muted) {
                this.audioCtx.resume();
            }

            this.overlay.hide('banner');
        }
    }

    // mute game
    mute() {
        let key = this.prefix.concat('muted');
        localStorage.setItem(
            key,
            localStorage.getItem(key) === 'true' ? 'false' : 'true'
        );
        this.state.muted = localStorage.getItem(key) === 'true';

        this.overlay.setMute(this.state.muted);

        if (this.state.muted) {
            // mute all game sounds
            this.audioCtx.suspend();
        } else {
            // unmute all game sounds
            if (!this.state.paused) {
                this.audioCtx.resume();
            }
        }
    }

    // reset game
    reset() {
        document.location.reload();
    }

    // update game state
    setState(state) {
        this.state = {
            ...this.state,
            ... { prev: this.state.current },
            ...state,
        };
    }

    // request new frame
    // wraps requestAnimationFrame.
    // see game/helpers/animationframe.js for more information
    requestFrame(next, resumed) {
        let now = Date.now();
        this.frame = {
            count: requestAnimationFrame(next),
            time: now,
            rate: resumed ? 0 : now - this.frame.time,
            scale: this.screen.scale * this.frame.rate * 0.01
        };
    }

    // cancel frame
    // wraps cancelAnimationFrame.
    // see game/helpers/animationframe.js for more information
    cancelFrame() {
        cancelAnimationFrame(this.frame.count);
    }
}

export default Game;