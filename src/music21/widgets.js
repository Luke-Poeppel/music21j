/**
 * music21j -- Javascript reimplementation of Core music21 features.
 * music21/widgets -- tools for web display
 *
 * Copyright (c) 2013-17, Michael Scott Cuthbert and cuthbertLab
 * Based on music21, Copyright (c) 2006–17, Michael Scott Cuthbert and cuthbertLab
 *
 */
import * as $ from 'jquery'; // ../ext/jquery/jquery-3.2.1.min.js';

import { note } from './note.js';
import { stream } from './stream.js';
import { tie } from './tie.js';

/**
 * Widgets module -- random widgets.  See {@link music21.widgets}
 *
 * @exports music21/widgets
 */

/**
 * Widgets module -- random widgets to make streams etc. work better
 *
 * To be added to
 *
 * @namespace music21.widgets
 * @memberof music21
 */
export const widgets = {};
/**
 * A set of DOM Objects for choosing rhythms
 *
 * @class RhythmChooser
 * @memberof music21.widgets
 * @param {music21.stream.Stream} s - to append to, etc.
 * @param {DOMObject} div - canvas or SVG
 * @property {Array<string>} values - an array of rhythmic values and editing functions.
 *           Default: ['whole', 'half','quarter','eighth','16th','dot','undo']
 * @property {Boolean} measureMode - whether to use measures when editing
 * @property {Boolean} tieActive - is a tie active?
 * @property {Boolean} autoAddMeasure - add a measure when one is full? default: true
 * @property {music21.stream.Stream} stream
 * @property {DOMObject} [div]
 */
export class RhythmChooser {
    constructor(streamObj, div, size = 'normal') {
        this.stream = streamObj;
        this.div = div;
        this.size = size;
        if (this.size === 'sm' || this.size === 'small') {
            this.sizeRatio = 0.5;
        } else {
            this.sizeRatio = 1.0;
        }
        
        this.values = [
            'whole',
            'half',
            'quarter',
            'eighth',
            '16th',
            'dot',
            'undo',
        ];

        if (this.stream.hasSubStreams()) {
            this.measureMode = true;
        } else {
            this.measureMode = false;
        }
        this.tieActive = false;
        this.autoAddMeasure = true;
        /**
         * A mapping of a type to a string of HTML entities to display in
         * BravuraText
         *
         * @name valueMappings
         * @type {object}
         * @memberof music21.widgets.RhythmChooser
         */
        this.valueMappings = {
            whole: '&#xEB9B;&#xE1D2;',
            half: '&#xEB9B;&#xE1D3;',
            quarter: '&#xEB9B;&#xE1D5;',
            eighth: '&#xEB9B;&#xE1D7;',
            '16th': '&#xEB9B;&#xE1D9;',
            '32nd': '&#xEB9B;&#xE1DB;', // BUG in Bravura Text
            addMeasure: '&#xE031',
            dot: '&#xEB9B;&#xE1E7;',
            undo: '&#x232B;',
            tie: '<span style="position: relative; top: ' + -20 * this.sizeRatio + 'px;">&#xE1FD</span>',
            rest_whole: '&#xE4F4;',
            rest_half: '&#xE4F5;',
            rest_quarter: '&#xE4E5;',
            rest_eighth: '&#xE4E6;',
            rest_16th: '&#xE4E7;',
            rest_32nd: '&#xE4E8;',
        };
        /**
         * A mapping of a type to a css style
         *
         * @name styles
         * @type {object}
         * @memberof music21.widgets.RhythmChooser
         */
        this.styles = {
            undo: 'font-family: serif; font-size: ' + 30 * this.sizeRatio + 'pt; top: -' + 8 * this.sizeRatio + 'px;',
        };
        /**
         * An object mapping a value type to a function when it is clicked
         *
         * the 'default' value handles all types not otherwise given.
         *
         * Each function is passed the type that was clicked. Probably only
         * useful for 'default'
         *
         * @name buttonHandlers
         * @type {object}
         * @memberof music21.widgets.RhythmChooser#
         */
        this.buttonHandlers = {
            undo: unused_t => {
                if (this.stream.length > 0) {
                    return this.stream.pop();
                } else {
                    return undefined;
                }
            },
            dot: unused_t => {
                if (this.stream.length > 0) {
                    const el = this.stream.pop();
                    el.duration.dots += 1;
                    this.stream.append(el);
                    return el;
                } else {
                    return undefined;
                }
            },
            tie: unused_t => {
                if (this.stream.length > 0) {
                    const el = this.stream.get(-1);
                    el.tie = new tie.Tie('start');
                    this.tieActive = true;
                    return el;
                } else {
                    return undefined;
                }
            },
            default: buttonM21type => {
                let newN = new note.Note('B4');
                newN.stemDirection = 'up';
                if (buttonM21type.indexOf('rest_') === 0) {
                    newN = new note.Rest();
                    buttonM21type = buttonM21type.slice('rest_'.length);
                }
                newN.duration.type = buttonM21type;
                if (this.tieActive) {
                    newN.tie = new tie.Tie('stop');
                    this.tieActive = false;
                }
                this.stream.append(newN);
                return newN;
            },
        };
        /**
         * An object mapping a value type to a function when it is clicked if the
         * RhythmChooser is in measureMode
         *
         * the 'default' value handles all types not otherwise given.
         *
         * Each function is passed the type that was clicked. Probably only
         * useful for 'default'
         *
         * @name measureButtonHandlers
         * @type {object}
         * @memberof music21.widgets.RhythmChooser#
         */
        this.measureButtonHandlers = {
            undo: unused_t => {
                if (this.stream.length > 0) {
                    const lastMeasure = this.stream.get(-1);
                    const retValue = lastMeasure.pop();
                    if (lastMeasure.length === 0 && this.stream.length > 1) {
                        this.stream.pop();
                    }
                    return retValue;
                } else {
                    return undefined;
                }
            },
            dot: unused_t => {
                if (this.stream.length > 0) {
                    const lastMeasure = this.stream.get(-1);
                    const el = lastMeasure.pop();
                    el.duration.dots += 1;
                    lastMeasure.append(el);
                    return el;
                } else {
                    return undefined;
                }
            },
            addMeasure: unused_t => {
                const lastMeasure = this.stream.get(-1);
                const m = new stream.Measure();
                m.renderOptions.staffLines
                    = lastMeasure.renderOptions.staffLines;
                m.renderOptions.measureIndex
                    = lastMeasure.renderOptions.measureIndex + 1;
                m.renderOptions.rightBarline = 'end';
                lastMeasure.renderOptions.rightBarline = 'single';
                m.autoBeam = lastMeasure.autoBeam;
                this.stream.append(m);
            },
            tie: unused_t => {
                const lastMeasure = this.stream.get(-1);
                let el;
                if (lastMeasure.length > 0) {
                    el = lastMeasure.get(-1);
                } else {
                    const previousMeasure = this.stream.get(-2);
                    if (previousMeasure) {
                        el = previousMeasure.get(-1);
                    }
                }
                if (el !== undefined) {
                    let tieType = 'start';
                    if (el.tie !== undefined) {
                        tieType = 'continue';
                    }
                    el.tie = new tie.Tie(tieType);
                    this.tieActive = true;
                }
            },
            default: buttonM21type => {
                let newN = new note.Note('B4');
                newN.stemDirection = 'up';
                if (buttonM21type.indexOf('rest_') === 0) {
                    newN = new note.Rest();
                    buttonM21type = buttonM21type.slice('rest_'.length);
                }
                newN.duration.type = buttonM21type;
                if (this.tieActive) {
                    newN.tie = new tie.Tie('stop');
                    this.tieActive = false;
                }
                let lastMeasure = this.stream.get(-1);
                if (
                    this.autoAddMeasure
                    && lastMeasure.duration.quarterLength
                        >= this.stream.timeSignature.barDuration.quarterLength
                ) {
                    this.measureButtonHandlers.addMeasure.apply(this, [
                        buttonM21type,
                    ]);
                    lastMeasure = this.stream.get(-1);
                }
                lastMeasure.append(newN);
                return newN;
            },
        };
    }
    /**
     * adds a RhythmChooser widget somewhere.
     *
     * @memberof music21.widgets.RhythmChooser
     * @param {DOMObject|JQueryDOMObject} where
     */
    addDiv(where) {
        let $where = where;
        if (where !== undefined && where.jquery === undefined) {
            $where = $(where);
        }
        const $outer = $('<div class="rhythmButtonDiv"/>');
        for (let i = 0; i < this.values.length; i++) {
            const value = this.values[i];
            const entity = this.valueMappings[value];
            let sizeClass = '';
            if (this.size === 'sm' || this.size === 'small') {
                sizeClass = 'btButtonSm';
            }
            const $inner = $(
                '<button class="btButton ' + sizeClass + '" m21Type="'
                    + value
                    + '">'
                    + entity
                    + '</button>'
            );
            if (this.styles[value] !== undefined) {
                $inner.attr('style', this.styles[value]);
            }

            $inner.click(
                function rhythmButtonDiv_click(value) {
                    this.handleButton(value);
                }.bind(this, value)
            );
            $outer.append($inner);
        }
        if (where !== undefined) {
            $where.append($outer);
        }
        return $outer;
    }
    /**
     * A button has been pressed! Call the appropriate handler and update the stream's SVG (if any)
     *
     * @memberof music21.widgets.RhythmChooser
     * @param {string} t - type of button pressed.
     */
    handleButton(t) {
        let bhs = this.buttonHandlers;
        if (this.measureMode) {
            bhs = this.measureButtonHandlers;
        }
        let bh = bhs[t];
        if (bh === undefined) {
            bh = bhs.default;
        }
        bh.apply(this, [t]);
        let s = this.stream;

        // redraw score if Part is part of score...
        if (s.isClassOrSubclass('Part') && s.activeSite !== undefined) {
            s = s.activeSite;
        }
        if (this.div !== undefined) {
            s.replaceDOM(this.div);
        }
    }
}
widgets.RhythmChooser = RhythmChooser;

export class Augmenter {
    constructor(streamObj, div) {
        this.streamObj = streamObj;
        this.div = div;
    }

    performChange(amountToScale, streamObjToWorkOn) {
        let replaceDOM = false;
        if (streamObjToWorkOn === undefined) {
            replaceDOM = true;
            streamObjToWorkOn = this.streamObj;
        }
        for (let i = 0; i < streamObjToWorkOn.length; i++) {
            const el = streamObjToWorkOn.get(i);
            if (el.isStream === true) {
                this.performChange(amountToScale, el);
            } else {
                el.duration.quarterLength *= amountToScale;
            }
        }
        if (streamObjToWorkOn.timeSignature !== undefined) {
            streamObjToWorkOn.timeSignature.denominator *= 1 / amountToScale;
        }

        if (this.div !== undefined && replaceDOM === true) {
            this.div = streamObjToWorkOn.replaceDOM(this.div);
        }
    }

    makeSmaller() {
        return this.performChange(0.5);
    }

    makeLarger() {
        return this.performChange(2.0);
    }

    addDiv($where) {
        const $newDiv = $('<div class="augmenterDiv" />');
        const $smaller = $(
            '<button class="augmenterButton">Make Smaller</button>'
        );
        const $larger = $(
            '<button class="augmenterButton">Make Larger</button>'
        );

        $smaller.on('click', () => {
            this.makeSmaller();
        });
        $larger.on('click', () => {
            this.makeLarger();
        });

        $newDiv.append($smaller);
        $newDiv.append($larger);

        $where.append($newDiv);
        return $newDiv;
    }
}

widgets.Augmenter = Augmenter;
