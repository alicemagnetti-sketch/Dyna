import type { FluidIntake, VoidingEntry } from "./types";

export type TimeBlock = {
  start: string; // "08:00"
  end: string; // "10:00"
  fluids: FluidIntake[];
  voidings: VoidingEntry[];
  totalFluidIn: number;
  totalUrineOut: number;
};

const BLOCK_LABELS: [string, string][] = [
  ["00:00", "02:00"],
  ["02:00", "04:00"],
  ["04:00", "06:00"],
  ["06:00", "08:00"],
  ["08:00", "10:00"],
  ["10:00", "12:00"],
  ["12:00", "14:00"],
  ["14:00", "16:00"],
  ["16:00", "18:00"],
  ["18:00", "20:00"],
  ["20:00", "22:00"],
  ["22:00", "00:00"],
];

/** Get 0–11 block index from hour (0–23). 22:00–00:00 is index 11. */
function blockIndexFromHour(hour: number): number {
  if (hour >= 22) return 11;
  return Math.floor(hour / 2);
}

/** Get block index from ISO timestamp (e.g. "2026-02-26T10:15:00.000Z"). */
function blockIndexFromTimestamp(timestamp: string): number {
  const date = new Date(timestamp);
  const hour = date.getHours();
  return blockIndexFromHour(hour);
}

export function groupByTimeBlock(
  fluids: FluidIntake[],
  voidings: VoidingEntry[]
): TimeBlock[] {
  const fluidByBlock: FluidIntake[][] = Array.from({ length: 12 }, () => []);
  const voidingByBlock: VoidingEntry[][] = Array.from({ length: 12 }, () => []);

  for (const f of fluids) {
    const idx = blockIndexFromTimestamp(f.timestamp);
    fluidByBlock[idx].push(f);
  }
  for (const v of voidings) {
    const idx = blockIndexFromTimestamp(v.timestamp);
    voidingByBlock[idx].push(v);
  }

  return BLOCK_LABELS.map(([start, end], i) => {
    const blockFluids = fluidByBlock[i];
    const blockVoidings = voidingByBlock[i];
    const totalFluidIn = blockFluids.reduce((s, f) => s + f.volume_ml, 0);
    const totalUrineOut = blockVoidings.reduce((s, v) => s + (v.volume_ml ?? 0), 0);
    return {
      start,
      end,
      fluids: blockFluids,
      voidings: blockVoidings,
      totalFluidIn,
      totalUrineOut,
    };
  });
}
