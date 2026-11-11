declare module 'heic-convert/browser' {
  interface ConvertOptions {
    buffer: Uint8Array;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }

  function convert(options: ConvertOptions): Promise<Uint8Array>;

  export default convert;
}
