import { Slug } from "../interface";

// Slugを作るための関数index.tsで起動時に呼び出すことを想定
export const generateNewSlug = (seed: number): XorShift =>
  new XorShift(BigInt(seed));

// Slugを生成する関数。
export const slugGenerator = (generator: XorShift): Slug =>
  generator
    .getFromRange(1208925800000000000000024n, 1208925819614629174706176n)
    .toString(16);

class XorShift {
  x: bigint;
  y: bigint;
  z: bigint;
  seed: bigint;
  constructor(seed = BigInt(Date.now())) {
    this.x = 123456789n;
    this.y = 984328975n;
    this.z = 839047104n;
    this.seed = seed;
  }
  gen(): bigint {
    const t = this.x ^ (this.x << 11n);
    this.x = this.y;
    this.y = this.z;
    this.z = this.seed;
    return (this.seed =
      this.seed ^ (this.seed / (2n ^ 19n)) ^ (t ^ (t / (2n ^ 8n))));
  }
  getFromRange(min: bigint, max: bigint): bigint {
    const r = this.abs(this.gen());
    return min + (r % (max + 1n - min));
  }

  abs(num: bigint): bigint {
    return num < 0 ? -1n * num : num;
  }
}
