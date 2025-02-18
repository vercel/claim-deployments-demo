declare module "textlinestream" {
  export interface TextLineStreamOptions<T> {
    allowCR?: boolean;
    returnEmptyLines?: boolean;
    mapperFun?: (line: string) => T;
  }

  export default class TextLineStream<T = string> extends TransformStream<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    T
  > {
    constructor(options?: TextLineStreamOptions<T>);
  }
}
