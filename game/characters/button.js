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

        this.active = true;
        this.lane = options.lane;
        this.bounds = {
            top: -200,
            right: 2000,
            left: -200,
            bottom: 2000
        };
    }
}

export default Button;