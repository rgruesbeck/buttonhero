/**
 * game/objects/sprite.js
 * 
 * What it Does:
 *   This file is a basic sprite
 *   it implements abilities like move(x, y), speed, direction, and bounds,
 *   centerX and centerY (cx, cy) and radius
 * 
 * What to Change:
 *   Add any new methods you want all your
 *   game characters that are also sprites to have.
 *   eg. 
 * 
 */

import {
    bounded
} from '../utils/baseUtils.js'

class Sprite {
    constructor({
        x,
        y,
        width,
        height,
        speed = 1,
        direction = 'right',
        bounds,
        active = true
    }) {
        // x and y
        this.x = x;
        this.y = y;

        // previous x and y
        this.px = x;
        this.py = y;

        // center x and y
        this.cx = x + (width / 2);
        this.cy = y + (height / 2);

        // velocity x and y
        this.vx = 0;
        this.vy = 0;

        // width and height
        this.width = width;
        this.height = height;

        // radius
        this.radius = (width + height) / 4;

        // speed of sprite
        this.speed = speed || 1;

        // direction
        this.direction = direction;

        // target
        this.target = {
            x: null,
            y: null
        };

        // bounds
        this.setBounds(bounds);

        // active
        this.active = active;
    }

    move(x, y, m) {
        // direct dx
        let dx = x === 0 ? this.x : this.x + (x * this.speed * m);
        let dy = y === 0 ? this.y : this.y + (y * this.speed * m);

        // target dx
        if (this.target.x != null) {
            dx = this.target.x != this.x ?
                dx + ((this.target.x - this.x) / 1000 * this.speed) :
                dx;
        }

        // target dy
        if (this.target.y != null) {
            dy = this.target.y != this.y ?
                dy + ((this.target.y - this.y) / 1000 * this.speed) :
                dy;
        }

        this.setX(dx);
        this.setY(dy);

        // set direction
        if (x < 0) {
            this.direction = 'right';
        }
        if (x > 0) {
            this.direction = 'left';
        }
    }

    moveTo(x = this.target.x, y = this.target.y) {
        this.target = {
            ...this.target,
            ...{
                x,
                y
            }
        };
    }

    setX(nx) {
        // apply x bounds
        const x = bounded(nx, this.bounds.left, this.bounds.right - this.width);
 
        this.px = this.x; // store previous x value
        this.x = x; // set x

        this.cx = this.x + (this.width / 2); // set center x
        this.vx = this.x - this.px; // set velocity x
    }

    setY(ny) {
        // apply x bounds
        const y = bounded(ny, this.bounds.top, this.bounds.bottom - this.height);

        this.py = this.y; // store previous y value
        this.y = y; // set y

        this.cy = this.y + (this.height / 2); // set center y
        this.vy = this.y - this.py; // set velocity y
    }
    
    setPosition(x, y) {
        this.setX(x);
        this.setY(y);
    }

    setBounds({
        top,
        right,
        bottom,
        left
    }) {
        let bounds = {
            top: top,
            right: right,
            bottom: bottom,
            left: left
        };

        this.bounds = {
            ...this.bounds,
            ...bounds
        }
    }
}

export default Sprite;