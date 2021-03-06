import * as QUnit from 'qunit';
import music21 from '../../src/loadModules';

export default function tests() {
    QUnit.test('music21.pitch.Accidental', assert => {
        const a = new music21.pitch.Accidental('-');
        assert.equal(a.alter, -1.0, 'flat alter passed');
        assert.equal(a.name, 'flat', 'flat name passed');
        a.name = 'sharp';
        assert.equal(a.alter, 1.0, 'flat alter passed');
        assert.equal(a.name, 'sharp', 'flat name passed');

        const b = new music21.pitch.Accidental('b');
        assert.equal(b.alter, -1.0, 'flat alter passed');
        assert.equal(b.name, 'flat', 'flat name passed');
    });

    QUnit.test('music21.pitch.Pitch', assert => {
        const p = new music21.pitch.Pitch('D#5');
        assert.equal(p.name, 'D#', 'Pitch Name set to D#');
        assert.equal(p.step, 'D', 'Pitch Step set to D');
        assert.equal(p.octave, 5, 'Pitch octave set to 5');
        assert.equal(p.nameWithOctave, 'D#5', 'Name with octave');
        const c = new music21.clef.AltoClef();
        const vfn = p.vexflowName(c);
        assert.equal(vfn, 'C#/6', 'Vexflow name set');
    });

    QUnit.test('music21.pitch.Pitch enharmonics', assert => {
        const es = new music21.pitch.Pitch('E-5');
        const dis = es.getLowerEnharmonic();
        assert.equal(es.name, 'E-', 'Original Pitch Name unchanged');
        assert.equal(dis.name, 'D#', 'Pitch Name set to D#');
        assert.equal(dis.step, 'D', 'Pitch Step set to D');
        assert.equal(dis.octave, 5, 'Pitch octave set to 5');

        // inPlace
        dis.getHigherEnharmonic(true); // inPlace
        assert.equal(dis.nameWithOctave, es.nameWithOctave);

        // once octaveless pitches exist...
//        const octaveless = new music21.pitch.Pitch('C');
//        const bsharp = octaveless.getLowerEnharmonic();
//        assert.equal(octaveless.octave, undefined, 'octave should be undefined');
//        assert.equal(bsharp.octave, undefined, 'octave should be undefined');
//        assert.equal(bsharp.name, 'B#');
        
    });

}
