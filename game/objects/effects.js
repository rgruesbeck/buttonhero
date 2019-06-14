/**
 * game/objects/effects.js
 * 
 * What it Does:
 *   This file contains effects for the game
 * 
 *   burst: get a particle burst
 * 
 * What to Change:
 *   Add any new methods that don't fit anywhere else
 *   eg. 
 * 
 */

import {
    randomBetween,
    valueOrRange
} from '../utils/baseUtils.js';

const imageParticleEmmiter = ({ n = 1 }) => {
    return Array.apply(null, { length: n })
    .map(() => { return {
        x: valueOrRange(x),
        y: valueOrRange(y),
        vx: valueOrRange(vx),
        vy: valueOrRange(vy),
        r: valueOrRange(1),
        alpha: valueOrRange(alpha),
        scale: 1
    }; });
}

const praticleEmitter = ({ n = 1, x = 0, y = 0, vx = 1, vy = 1, rd = 2, hue = 0, alpha = 1 }) => {
    return Array.apply(null, { length: n })
    .map(() => { return {
        x: valueOrRange(x),
        y: valueOrRange(y),
        vx: valueOrRange(vx),
        vy: valueOrRange(vy),
        rd: valueOrRange(rd),
        hue: valueOrRange(hue),
        alpha: valueOrRange(alpha)
    }; });
}

const radialWaveEmitter = ({ n = 1, x = 0, y = 0, rd = 2, width = 50, hue = 0, alpha = 1 }) => {
    return Array.apply(null, { length: n })
    .map(() => { return {
        x: valueOrRange(x),
        y: valueOrRange(y),
        width: valueOrRange(width),
        rd: valueOrRange(rd),
        hue: valueOrRange(hue),
        alpha: valueOrRange(alpha)
    }; });
}

const semiCircleEmmitter = ({ n = 1, x = 0, y = 0, height = 100, width = 100, hue = 0, alpha = 1 }) => {
    return Array.apply(null, { length: n })
    .map(() => { return {
        x: valueOrRange(x),
        y: valueOrRange(y),
        height: valueOrRange(height),
        width: valueOrRange(width),
        hue: valueOrRange(hue),
        alpha: valueOrRange(alpha)
    }; });
}

const convexCurveEmmitter = ({ n = 1, x = 0, y = 0, height = 100, width = 100, hue = 0, alpha = 1 }) => {
    return Array.apply(null, { length: n })
    .map(() => { return {
        x: valueOrRange(x),
        y: valueOrRange(y),
        height: valueOrRange(height),
        width: valueOrRange(width),
        hue: valueOrRange(hue),
        alpha: valueOrRange(alpha)
    }; });
}

const drawParticle = (ctx, p) => {
    ctx.beginPath();
    ctx.arc(p.x >> 0, p.y >> 0, p.rd >> 0, 0, 2 * Math.PI, false);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 100%, ${p.alpha})`;
    ctx.fill();
}

const drawImageParticle = (ctx, image, p) => {
    // https://stackoverflow.com/questions/17411991/html5-canvas-rotate-image
    ctx.setTransform(p.scale, 0, 0, p.scale, 0, 0); // sets scales and origin
    ctx.rotate(p.r);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
}

const drawWave = (ctx, w) => {
    ctx.beginPath();
    ctx.arc(w.x >> 0, w.y >> 0, w.rd >> 0, 0, 2 * Math.PI);
    ctx.lineWidth = w.width;
    ctx.strokeStyle = `hsla(${w.hue}, 100%, 50%, ${w.alpha})`;
    ctx.stroke();
}

const drawSemiCircle = (ctx, c) => {
   ctx.beginPath(); 
   ctx.moveTo(c.x, c.y);
   ctx.quadraticCurveTo(c.x + (c.width / 2), c.y - c.height, c.x + c.width, c.y);
   ctx.closePath();
   ctx.fillStyle = `hsla(${c.hue}, 100%, 90%, ${c.alpha})`;
   ctx.fill();
}

const drawConvexCurve = (ctx, c) => {
   ctx.beginPath(); 
   ctx.moveTo(c.x, c.y);
   ctx.quadraticCurveTo(c.x + (c.width / 2), c.y + (c.height / 2), c.x + c.width, c.y);
   ctx.lineTo(c.x + c.width, c.y + c.height);
   ctx.lineTo(c.x, c.y + c.height);
   ctx.lineTo(c.x, c.y);
   ctx.closePath();
   ctx.fillStyle = `hsla(${c.hue}, 100%, 90%, ${c.alpha})`;
   ctx.fill();
}

function Spark({ ctx, n = 10, x, y, vx, vy, burnRate }) {
    this.id = Math.random().toString(16).slice(2);
    this.type = 'burst';
    this.active = true;
    this.ctx = ctx;
    this.burnRate = burnRate;
    this.center = { x, y };
    this.shards = praticleEmitter({
        n: n,
        x: x,
        y: y,
        vx: vx || [-10, 10],
        vy: vy || [-10, 10],
        rd: [1, 3],
        hue: [200, 300]
    });
    this.tick = (frame) => {
        // only tick if active
        if (!this.active) { return; }

        // flag as in-active when no more shards
        if (this.shards.length === 0) {
            this.active = false;
            return;
        }

        // loop through burst shards
        for (let i = 0; i < this.shards.length; i++) {
            let shard = this.shards[i];

            // update position
            shard.x += shard.vx * Math.cos(frame * shard.vx / 120);
            shard.y += shard.vy;

            // update size and color
            shard.rd = Math.abs(shard.rd - this.burnRate);
            shard.hue -= this.burnRate * 5;

            // remove burned shards
            if (shard.rd < 1) {
                this.shards.splice(i, 1);
            }

            // draw shard
            drawParticle(this.ctx, shard);
        }
    }
}

function Splash({ ctx, x, y, width, height, hue = [300, 350], burnRate = 100 }) {
    this.id = Math.random().toString(16).slice(2);
    this.type = 'splash';
    this.active = true;
    this.ctx = ctx;
    this.center = { x, y };
    this.burnRate = (Array.isArray(burnRate) ? randomBetween(burnRate[0], burnRate[1]) : burnRate) / 100;
    this.sheets = semiCircleEmmitter({
        x: x,
        y: y,
        width: width,
        height: height,
        hue: hue,
        alpha: 1
    })

    this.tick = (frame) => {
        // only tick if active
        if (!this.active) { return; }

        // flag as in-active when no more sheets
        if (this.sheets.length === 0) {
            this.active = false;
            return;
        }

        // loop through waves 
        for (let i = 0; i < this.sheets.length; i++) {
            let sheet = this.sheets[i];

            // draw waves
            // sheet.hue -= this.burnRate;
            sheet.alpha -= this.burnRate;
            console.log(this.burnRate, sheet.alpha);

            if (sheet.alpha < 0) {
                this.sheets.splice(i, 1);
            }

            // draw shimmer
            drawConvexCurve(this.ctx, sheet);
        }

    }
}

function Shimmer({ ctx, x, y, width, height, hue = [300, 350], burnRate = 100 }) {
    this.id = Math.random().toString(16).slice(2);
    this.type = 'shimmer';
    this.active = true;
    this.ctx = ctx;
    this.center = { x, y };
    this.burnRate = (Array.isArray(burnRate) ? randomBetween(burnRate[0], burnRate[1]) : burnRate) / 100;
    this.sheets = semiCircleEmmitter({
        x: x,
        y: y,
        width: width,
        height: height,
        hue: hue,
        alpha: 1
    })

    this.tick = (frame) => {
        // only tick if active
        if (!this.active) { return; }

        // flag as in-active when no more sheets
        if (this.sheets.length === 0) {
            this.active = false;
            return;
        }

        // loop through waves 
        for (let i = 0; i < this.sheets.length; i++) {
            let sheet = this.sheets[i];

            // draw waves
            // sheet.hue -= this.burnRate;
            sheet.alpha = Math.abs(Math.cos(frame / 60)) / 4 + 0.15;

            if (sheet.width < 1) {
                this.sheets.splice(i, 1);
            }

            // draw shimmer
            drawConvexCurve(this.ctx, sheet);
        }

    }
}

export {
    Spark,
    Splash,
    Shimmer
};