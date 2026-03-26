/**
 * Fallback type declaration for 'cheerio' so that subprojects
 * (e.g. samdeok-mansion/backend) that are type-checked by the root
 * build can resolve the module. The actual implementation comes from
 * node_modules/cheerio when available.
 */
declare module 'cheerio' {
  export interface CheerioAPI {
    (selector: string): { text: () => string };
    load(html: string | Buffer, options?: unknown): CheerioAPI;
  }
  export function load(html: string | Buffer, options?: unknown): CheerioAPI;
  export default function load(html: string | Buffer, options?: unknown): CheerioAPI;
}
