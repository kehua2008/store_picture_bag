import sharp from "sharp";
import type { GeneratedImage } from "../provider/types";

const cameraProfiles = [
  { make: "Canon", model: "Canon EOS R6 Mark II", lens: "RF 50mm F1.8 STM" },
  { make: "NIKON CORPORATION", model: "NIKON Z 6_2", lens: "NIKKOR Z 50mm f/1.8 S" },
  { make: "SONY", model: "ILCE-7M4", lens: "FE 55mm F1.8 ZA" },
  { make: "FUJIFILM", model: "X-T5", lens: "XF35mmF1.4 R" },
  { make: "Panasonic", model: "DC-S5M2", lens: "LUMIX S 50/F1.8" }
];

const exposureTimes = ["1/60", "1/80", "1/100", "1/125", "1/160", "1/200", "1/250"];
const fNumbers = [1.8, 2.0, 2.2, 2.8, 3.2, 4.0, 5.6];
const isoValues = [100, 125, 160, 200, 250, 320, 400, 640];
const focalLengths = [35, 40, 45, 50, 55, 70, 85];

export async function simulatePhotoMetadata(image: GeneratedImage): Promise<GeneratedImage> {
  if (!image.base64) return image;

  try {
    const input = Buffer.from(image.base64, "base64");
    const profile = pick(cameraProfiles, image.id);
    const seed = hash(image.id);
    const captureTime = randomCaptureTime(seed);
    const output = await sharp(input)
      .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
      .withExif({
        IFD0: {
          Make: profile.make,
          Model: profile.model,
          Software: "Adobe Lightroom Classic",
          DateTime: captureTime
        },
        IFD2: {
          DateTimeOriginal: captureTime,
          DateTimeDigitized: captureTime,
          LensModel: profile.lens,
          ExposureTime: exposureTimes[seed % exposureTimes.length],
          FNumber: String(fNumbers[seed % fNumbers.length]),
          ISOSpeedRatings: String(isoValues[seed % isoValues.length]),
          FocalLength: String(focalLengths[seed % focalLengths.length]),
          ExposureProgram: "3",
          MeteringMode: "5",
          Flash: "0",
          WhiteBalance: "0",
          ColorSpace: "1"
        }
      })
      .toBuffer();

    return {
      ...image,
      base64: output.toString("base64"),
      mimeType: "image/jpeg"
    };
  } catch {
    return image;
  }
}

function pick<T>(items: T[], key: string): T {
  return items[hash(key) % items.length];
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function randomCaptureTime(seed: number): string {
  const now = new Date();
  const daysAgo = (seed % 120) + 1;
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  date.setHours(9 + (seed % 10), (seed >>> 3) % 60, (seed >>> 9) % 60, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join(":") + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
