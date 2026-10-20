// Two original, deterministic instrumentals written for this gift.
// No sampled recordings or third-party melodies.
// Run: node scripts/generate-piano.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { Mp3Encoder } from "@breezystack/lamejs";

const sampleRate = 44100;
function createComposition(seconds) {
  const samples = new Float64Array(Math.ceil(seconds * sampleRate));
  function note(midi, start, volume, duration = 3.4) {
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const from = Math.floor(start * sampleRate);
    const length = Math.min(Math.floor(duration * sampleRate), samples.length - from);
    for (let j = 0; j < length; j++) {
      const t = j / sampleRate;
      const attack = 1 - Math.exp(-t * 120);
      const release = Math.min(1, (duration - t) / 0.3);
      const fundamental = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 1.5);
      const harmonics = .36 * Math.sin(2 * Math.PI * frequency * 2.001 * t) * Math.exp(-t * 2.8)
        + .14 * Math.sin(2 * Math.PI * frequency * 3.004 * t) * Math.exp(-t * 4)
        + .05 * Math.sin(2 * Math.PI * frequency * 4.008 * t) * Math.exp(-t * 5);
      samples[from + j] += (fundamental + harmonics) * attack * release * volume;
    }
  }
  return { samples, note, seconds };
}

async function render(composition, fileName) {
  const { samples, seconds } = composition;
  // A quiet room echo and a natural fade avoid hard starts and loop edges.
  const dry = samples.slice();
  for (let i = 0; i < samples.length; i++) {
    for (const [delay, level] of [[.13, .1], [.27, .065], [.41, .035]]) {
      const source = i - Math.floor(delay * sampleRate);
      if (source >= 0) samples[i] += dry[source] * level;
    }
  }
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const fade = Math.min(1, t / .65, (seconds - t) / 3);
    pcm[i] = Math.round(Math.tanh(samples[i]) * fade * 28000);
  }
  const encoder = new Mp3Encoder(1, sampleRate, 128);
  const chunks = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    chunks.push(Buffer.from(encoder.encodeBuffer(pcm.subarray(i, i + 1152))));
  }
  chunks.push(Buffer.from(encoder.flush()));
  await writeFile(`public/audio/${fileName}`, Buffer.concat(chunks));
  console.log(`Created ${fileName}: original piano, ${seconds.toFixed(1)}s.`);
}

await mkdir("public/audio", { recursive: true });

// "Một chút dịu dàng" — a simple, unhurried 4/4 opening in C major.
const beat = .72;
const opening = createComposition(48 * beat + 5);
const chords = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
const melody = [76, 74, 72, 67, 69, 72, 76, 74, 72, 69, 67, 64, 65, 69, 72, 77, 76, 72, 71, 67, 69, 71, 74, 72];
for (let bar = 0; bar < 12; bar++) {
  const chord = chords[bar % chords.length];
  for (let step = 0; step < 4; step++) opening.note(chord[step], (bar * 4 + step) * beat, step === 0 ? .14 : .075);
  opening.note(melody[bar * 2], (bar * 4 + .12) * beat, .10, 2.4);
  opening.note(melody[bar * 2 + 1], (bar * 4 + 2.12) * beat, .085, 2.4);
}
await render(opening, "20-10-piano.mp3");

// "Hoa và lời thương" — a separate, lilting 3/4 melody in G major.
// The light waltz pulse makes receiving the bouquet feel like a new chapter.
const flowerBeat = .79;
const flowers = createComposition(60 * flowerBeat + 6);
const flowerChords = [
  [43, 55, 59, 62], [47, 54, 59, 62], [48, 55, 60, 64], [50, 57, 62, 66],
  [40, 52, 55, 59], [45, 52, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62],
];
const flowerMelody = [
  [71, 74, 79], [78, 74], [76, 79, 76], [74, 69, 66],
  [67, 71, 74], [72, 71, 69], [67, 72, 76], [74, 71, 67],
  [79, 78, 74], [76, 74, 71], [72, 76, 79], [78, 76, 74],
  [71, 74, 76], [72, 69, 67], [64, 67, 72], [71, 67],
  [74, 79, 78], [76, 74, 72], [71, 69, 66], [67],
];
for (let bar = 0; bar < flowerMelody.length; bar++) {
  const chord = flowerChords[bar === flowerMelody.length - 1 ? 0 : bar % flowerChords.length];
  const beginning = bar * 3 * flowerBeat;
  flowers.note(chord[0], beginning, .11, 3.6);
  flowers.note(chord[1], beginning + flowerBeat, .052, 2.8);
  flowers.note(chord[2], beginning + flowerBeat * 1.06, .038, 2.8);
  flowers.note(chord[3], beginning + flowerBeat * 2, .048, 2.8);
  const notes = flowerMelody[bar];
  notes.forEach((midi, index) => {
    flowers.note(midi, beginning + (index * 3 / notes.length + .08) * flowerBeat,
      index === 0 ? .1 : .08, bar === 19 ? 4.8 : 2.7);
  });
}
await render(flowers, "20-10-for-you.mp3");
