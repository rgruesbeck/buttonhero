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

import colorConvert from 'color-convert';

import {
    randomBetween,
    valueOrRange
} from '../utils/baseUtils.js';

const praticleEmitter = ({ n = 1, x = 0, y = 0, vx = 1, vy = 1, rd = 2, hue = 0, sat = 100, light = 100, alpha = 1 }) => {
    return Array.apply(null, { length: n })
    .map(() => { return {
        x: valueOrRange(x),
        y: valueOrRange(y),
        vx: valueOrRange(vx),
        vy: valueOrRange(vy),
        rd: valueOrRange(rd),
        hue: valueOrRange(hue),
        sat: valueOrRange(sat),
        light: valueOrRange(light),
        alpha: valueOrRange(alpha)
    }; });
}

const radialWaveEmitter = ({ n = 1, x = 0, y = 0, rd = 2, width = 50, hue = 0, sat = 100, light = 100, alpha = 1 }) => {
    return Array.apply(null, { length: n })
    .map(() => { return {
        x: valueOrRange(x),
        y: valueOrRange(y),
        width: valueOrRange(width),
        rd: valueOrRange(rd),
        hue: valueOrRange(hue),
        sat: valueOrRange(sat),
        light: valueOrRange(light),
        alpha: valueOrRange(alpha)
    }; });
}

const drawParticle = (ctx, p) => {
    ctx.beginPath();
    ctx.arc(p.x >> 0, p.y >> 0, p.rd >> 0, 0, 2 * Math.PI, false);
    ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`;
    ctx.fill();
}

const drawWave = (ctx, w) => {
    ctx.beginPath();
    ctx.arc(w.x >> 0, w.y >> 0, w.rd >> 0, 0, 2 * Math.PI);
    ctx.lineWidth = w.width;
    ctx.strokeStyle = `hsla(${w.hue}, ${w.sat}%, ${w.light}%, ${w.alpha})`;
    ctx.stroke();
}

function Spark({ ctx, n = 10, x, y, vx, vy, color, burnRate }) {
    this.id = Math.random().toString(16).slice(2);
    this.type = 'burst';
    this.active = true;
    this.ctx = ctx;
    this.burnRate = burnRate;
    this.color = {
        hex: color,
        rgb: colorConvert.hex.rgb(color),
        hsl: colorConvert.hex.hsl(color)
    };

    this.center = { x, y };
    this.shards = praticleEmitter({
        n: n,
        x: x,
        y: y,
        vx: vx || [-10, 10],
        vy: vy || [-10, 10],
        rd: [1, 3],
        hue: this.color.hsl[0],
        sat: this.color.hsl[1],
        light: this.color.hsl[2]
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

function Burn({ ctx, x, y, width = 25, color, burnRate = 100 }) {
    this.id = Math.random().toString(16).slice(2);
    this.type = 'blast-wave';
    this.active = true;
    this.ctx = ctx;
    this.center = { x, y };
    this.burnRate = (Array.isArray(burnRate) ? randomBetween(burnRate[0], burnRate[1]) : burnRate) / 100;
    this.color = {
        hex: color,
        rgb: colorConvert.hex.rgb(color),
        hsl: colorConvert.hex.hsl(color)
    }

    this.waves = radialWaveEmitter({
        x: x,
        y: y,
        rd: 25,
        width: width,
        hue: this.color.hsl[0],
        sat: this.color.hsl[1],
        light: this.color.hsl[2],
        alpha: 1
    })

    this.tick = () => {
        // only tick if active
        if (!this.active) { return; }

        // flag as in-active when no more waves
        if (this.waves.length === 0) {
            this.active = false;
            return;
        }

        // loop through waves 
        for (let i = 0; i < this.waves.length; i++) {
            let wave = this.waves[i];

            // draw waves
            wave.rd = Math.max(wave.rd + this.burnRate * 5, 0);
            wave.hue -= this.burnRate / 2;
            wave.width -= this.burnRate / 2;
            wave.alpha -= this.burnRate * 0.1;

            // remove wave when larger than blast radius
            if (wave.alpha < 0) {
                this.waves.splice(i, 1);
            }

            // draw wave
            drawWave(this.ctx, wave);
        }

    }
}

export {
    Spark,
    Burn
};