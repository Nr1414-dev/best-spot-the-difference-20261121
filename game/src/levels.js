// Lantern Lane — level data.
//
// Every level is one hand-drawn scene painted twice from the same code:
// panel A is the base scene, panel B is the same scene with that level's
// differences applied. A difference is one localised edit with a named
// hit region (x, y, radius in the 640x420 scene space), a short label
// shown in the "found" list, and a hint line. Difficulty is tuned the
// way spot-the-difference designers tune it: salience (how much the
// changed region differs), placement (centre reads easy, edges and
// crowded patches read hard) and crowding (how many similar objects
// compete nearby). Level 1 keeps changes central and salient; level 3
// hides them at the edges and inside busy detail.

export const SCENE_W = 640;
export const SCENE_H = 420;

export const LEVELS = [
  {
    id: 'market',
    name: 'Morning Market',
    subtitle: 'A sleepy fruit stall wakes up',
    difficulty: 1,
    difficultyLabel: 'Easy',
    timeLimit: 150,
    differences: [
      { id: 'apple', x: 350, y: 318, r: 26, label: 'Missing apple', hint: 'Count the apples in the crate.' },
      { id: 'cat-tail', x: 512, y: 300, r: 26, label: 'Cat tail', hint: 'The cat on the crate is holding its tail differently.' },
      { id: 'sun-rays', x: 82, y: 62, r: 34, label: 'Sun rays', hint: 'Look up at the morning sun.' },
      { id: 'bird', x: 318, y: 96, r: 24, label: 'Extra bird', hint: 'How many birds sit on the wire?' },
      { id: 'awning', x: 210, y: 128, r: 26, label: 'Awning stripe', hint: 'One stripe of the striped awning changed colour.' },
      { id: 'oranges', x: 452, y: 318, r: 26, label: 'Orange count', hint: 'Count the oranges in the basket.' },
      { id: 'sign-star', x: 92, y: 208, r: 24, label: 'Sign star', hint: 'Something small is missing from the shop sign.' },
    ],
  },
  {
    id: 'harbor',
    name: 'Harbor at Dusk',
    subtitle: 'Boats come home as the light goes',
    difficulty: 2,
    difficultyLabel: 'Medium',
    timeLimit: 150,
    differences: [
      { id: 'beam', x: 556, y: 120, r: 40, label: 'Lighthouse beam', hint: 'The lighthouse is not shining the same way.' },
      { id: 'flag', x: 176, y: 236, r: 24, label: 'Boat flag', hint: 'The little red boat lost something on its mast.' },
      { id: 'gull', x: 330, y: 78, r: 24, label: 'Extra gull', hint: 'Count the gulls in the evening sky.' },
      { id: 'buoy', x: 452, y: 322, r: 24, label: 'Buoy colour', hint: 'The buoy bobbing by the dock changed colour.' },
      { id: 'rope', x: 96, y: 372, r: 26, label: 'Rope coil', hint: 'Something is missing from the wooden dock.' },
      { id: 'window', x: 556, y: 168, r: 22, label: 'Tower window', hint: 'One lighthouse window is dark now.' },
      { id: 'fish', x: 268, y: 330, r: 26, label: 'Jumping fish', hint: 'Something is leaping out of the water.' },
    ],
  },
  {
    id: 'lantern',
    name: 'Lantern Festival',
    subtitle: 'A night of paper light and fireworks',
    difficulty: 3,
    difficultyLabel: 'Hard',
    timeLimit: 180,
    differences: [
      { id: 'moon', x: 548, y: 62, r: 34, label: 'Moon phase', hint: 'The moon over the rooftops is not the same.' },
      { id: 'lantern-color', x: 236, y: 148, r: 24, label: 'Lantern colour', hint: 'One paper lantern on the string changed colour.' },
      { id: 'star', x: 130, y: 52, r: 20, label: 'Extra star', hint: 'A new star appeared in the night sky.' },
      { id: 'firework', x: 428, y: 88, r: 30, label: 'Firework burst', hint: 'There is one more firework in the sky.' },
      { id: 'roof-cat', x: 96, y: 268, r: 26, label: 'Roof cat', hint: 'A cat was watching from a rooftop.' },
      { id: 'lantern-missing', x: 388, y: 158, r: 24, label: 'Missing lantern', hint: 'One lantern is gone from the string.' },
      { id: 'banner', x: 320, y: 258, r: 26, label: 'Banner star', hint: 'The festival banner lost its star.' },
    ],
  },
];
