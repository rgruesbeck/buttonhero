/**
 * game/objects/imageSprite.js
 * 
 * What it Does:
 *   This file is a basic image sprite it extends the sprite class
 *   and draws an image to the screen
 * 
 * What to Change:
 *   Add any new methods you want all your
 *   game characters that are also sprites to have.
 *   eg. 
 * 
 */

import Sprite from './sprite.js';

class ImageSprite extends Sprite {
    constructor(options) {
        super(options);

        this.ctx = options.ctx;
        this.imageKey = options.imageKey;
    }

    draw(images) {
        // ignore in-active sprites
        if (!this.active) { return; }

        // save canvas context
        this.ctx.save();

        // code for flipping image to match direction
        let scaleX = this.direction === 'left' ? -1 : 1;
        let xPosition = this.direction === 'left' ? -1 * this.x : this.x;
        let trX = this.direction === 'left' ? this.width : 0;

        this.ctx.translate(trX, 0);
        this.ctx.scale(scaleX, 1);

        // draw the image to canvas
        this.ctx.drawImage(
            images[this.imageKey],
            xPosition >> 0,
            this.y >> 0,
            this.width,
            this.height
        );

        // restore canvas context
        this.ctx.restore();
    }
}

export default ImageSprite;