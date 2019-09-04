/**
 * game/character/button.js
 * 
 * What it Does:
 *   This file is a basic button character
 *   it extends the imageSprite class and adds two collision detections methods
 * 
 * What to Change:
 *   Add any character specific methods
 *   eg. eat
 * 
 */

import ImageSprite from '../objects/imageSprite.js';

class Button extends ImageSprite {
    constructor(options) {
        super(options);

        // save original width and height
        this.originalWidth = options.width;
        this.originalHeight = options.height;

        // save original position
        this.originalX = options.x;
        this.originalY = options.y;

        this.id = Math.random().toString(16).slice(2);
        this.meta = options.meta;
        this.goal = options.goal || false;
        this.lane = options.lane;
        this.bounds = {
            top: -200,
            right: 2000,
            left: -200,
            bottom: 2000
        };

    }

    draw(images) {
        if (this.goal) {
            // return to originalWidth
            if (this.width < this.originalWidth) {
                this.width += (this.originalWidth - this.width) / 10;
            }

            // return to originalHeight
            if (this.height < this.originalHeight) {
                this.height += (this.originalHeight - this.height) / 10;
            }

            // return to originalX
            if (this.x > this.originalX) {
                this.x -= (this.x - this.originalX) / 10;
            }

            // return to originalY
            if (this.y > this.originalY) {
                this.y -= (this.y - this.originalY) / 10;
            }

        }

        super.draw(images);
    }

    pressed() {
        if (this.goal) {
            // set pressed width and height
            this.width = this.width - (this.width / 8);
            this.height = this.height - (this.height / 8);

            // set pressed position
            this.x = this.x + (this.width / 16);
            this.y = this.y + (this.height / 16);
        }
    }

    recycle({ imageKey, lane, x, y }) {
        if ([imageKey, lane, x, y].includes(undefined)) { return; } // ignore missing args
        if (imageKey === this.imageKey) { return; } // ignore duplicates

        // new imageKey
        this.imageKey = imageKey;

        // set position
        this.setPosition(x, y)

        // set lane
        this.lane = lane;

        // set to active
        this.active = true;
    }

    suspend() {
        this.active = false;
    }
}

export default Button;