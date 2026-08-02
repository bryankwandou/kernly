import type { Block } from "./types.js";
export declare function normalize(input: string): string;
export declare function segment(input: string, pinPatterns?: RegExp[]): Block[];
