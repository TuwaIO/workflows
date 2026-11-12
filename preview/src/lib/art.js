/**
 * @file The pixel pictures of TUWA the previews reuse, row by row: `.` is empty, `#` or a small letter a pixel of
 * ink, `o` or a capital letter a lit pixel (the accent). They are copied as they are from where the site keeps them,
 * so a preview shows the same craft, Earth and icons as the site:
 *
 * - the craft and the Earth of the flight plan: `packages/docs-ui/src/flightArt.ts` of `TuwaIO/docs`;
 * - the icons of the projects: `packages/docs-ui/src/projectIcons.ts` of `TuwaIO/docs`;
 * - the wallet, sign-in and transactions icons: `packages/nova-icons/src` of `TuwaIO/nova-uikit`.
 *
 * When one of them changes there, copy it here again.
 */

/**
 * The craft, nose to the right: the flames (2 columns: `A`, and `b`, the far end of a flame) behind the hull
 * (9 columns), 7 rows. Its middle row lies on the line it flies along.
 */
// prettier-ignore
export const SHIP = [
  '...##......',
  '....##.....',
  'bA#######..',
  '...####o###',
  'bA#######..',
  '....##.....',
  '...##......',
];

/**
 * The same craft seen from above, nose up: its hull (9 rows: the nose, the lit cockpit, two wings, two engines) over
 * the flames of the engines (2 rows: `A`, and `b`, the far end of a flame).
 */
// prettier-ignore
export const SHIP_UP = [
  '....#....',
  '....#....',
  '...###...',
  '...#o#...',
  '#..###..#',
  '#.#####.#',
  '#########',
  '##.###.##',
  '#..#.#..#',
  '...A.A...',
  '...b.b...',
];

/** How many columns of the craft are its flames. */
export const SHIP_FLAME_CELLS = 2;

/** The Earth of the flight line: a globe in an outline with its continents (`o`). */
// prettier-ignore
export const EARTH_SMALL = [
  '..###..',
  '.#oo.#.',
  '#oo.oo#',
  '#.o.oo#',
  '#...o.#',
  '.#o..#.',
  '..###..',
];

/** The icons of the projects, on a 9 × 9 grid. */
// prettier-ignore
export const PROJECT_ICONS = {
  'sign-in': [
    '.....####',
    '........#',
    '....a...#',
    '.....a..#',
    'aaaaaaA.#',
    '.....a..#',
    '....a...#',
    '........#',
    '.....####',
  ],
  orbit: [
    '...###...',
    '.##...##.',
    '.#.....#.',
    '#..ooo..#',
    '#..ooo..#',
    '#..ooo..#',
    '.#.....#.',
    '.##...##.',
    '...###...',
  ],
  satellite: [
    '...b.b...',
    '....A....',
    '....#....',
    '...###...',
    '##.###.##',
    '#########',
    '##.###.##',
    '...###...',
    '.........',
  ],
  pulsar: [
    '........C',
    '.......B.',
    '....#.A..',
    '...ooo...',
    '..#ooo#..',
    '...ooo...',
    '..A.#....',
    '.B.......',
    'C........',
  ],
  cloud: [
    '.........',
    '....ooo..',
    '..##...#.',
    '.#......#',
    '#.......#',
    '#.......#',
    '.#######.',
    '..A.B.C..',
    '.........',
  ],
  supernova: [
    'A...b...A',
    '....#....',
    '..#.#.#..',
    '...CCC...',
    'b##CCC##b',
    '...CCC...',
    '..#.#.#..',
    '....#....',
    'A...b...A',
  ],
  terminal: [
    '#########',
    '#########',
    '#.......#',
    '#.#.....#',
    '#..#....#',
    '#.#.ABC.#',
    '#.......#',
    '#.......#',
    '#########',
  ],
};

/** The icons of Nova, on a 16 × 16 grid. */
// prettier-ignore
export const NOVA_ICONS = {
  /** A wallet with its clasp lit: `WalletIcon` */
  wallet: [
    '................',
    '................',
    '..##########....',
    '.##........##...',
    '.##############.',
    '.##############.',
    '.##..........##.',
    '.##.......#####.',
    '.##.......#oo##.',
    '.##.......#####.',
    '.##..........##.',
    '.##..........##.',
    '.##############.',
    '.##############.',
    '................',
    '................',
  ],
  /** An arrow entering a door: `ArrowLeftStartOnRectangleIcon`, sign in */
  signIn: [
    '................',
    '..########......',
    '.#########......',
    '.##.............',
    '.##....##.......',
    '.##...###.......',
    '.##..###........',
    '.##.###########.',
    '.##.###########.',
    '.##..###........',
    '.##...###.......',
    '.##....##.......',
    '.##.............',
    '.#########......',
    '..########......',
    '................',
  ],
  /** A pulsar, a lit core with two beams: `TransactionsIcon` */
  transactions: [
    '................',
    '.............##.',
    '.......##...###.',
    '.....#####.###..',
    '....#########...',
    '...###....##....',
    '...##..oo..##...',
    '..###.oooo.###..',
    '..###.oooo.###..',
    '...##..oo..##...',
    '....##....###...',
    '...#########....',
    '..###.#####.....',
    '.###...##.......',
    '.##.............',
    '................',
  ],
};

/**
 * Whether a mark of a picture is a lit pixel.
 * @param mark The mark.
 * @returns `true` for `o` and for a capital letter.
 */
export const isLit = (mark) => mark === 'o' || (mark !== '#' && mark !== mark.toLowerCase());

/**
 * The pixels of a picture.
 * @param rows The rows of the picture.
 * @returns Each pixel: its column, its row and whether it is lit.
 */
export function cellsOf(rows) {
  return rows.flatMap((row, r) => [...row].flatMap((mark, c) => (mark === '.' ? [] : [{ c, r, lit: isLit(mark) }])));
}
