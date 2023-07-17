import { Slug } from "interface";
export const generateNewSlag = (seed: string): Slug => {
  const slugNumber = new XorShift(Number(seed)).getFromRange(
    0,
    1208925819614629174706176
  );
  return slugNumber.toString(16);
};

export class XorShift {
  x: number;
  y: number;
  z: number;
  seed: number;
  constructor(seed = Date.now()) {
    this.x = 123456789;
    this.y = 984328975;
    this.z = 839047104;
    this.seed = seed;
  }
  gen(): number {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.seed;
    return (this.seed = this.seed ^ (this.seed >>> 19) ^ (t ^ (t >>> 8)));
  }
  getFromRange(min: number, max: number): number {
    const r = Math.abs(this.gen());
    return min + (r % (max + 1 - min));
  }
}
