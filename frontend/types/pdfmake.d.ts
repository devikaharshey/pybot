declare module "pdfmake/build/pdfmake" {
  import type * as pdfmake from "pdfmake";
  const pdfMake: typeof pdfmake;
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const pdfFonts: {
    vfs: Record<string, string>;
  };
  export default pdfFonts;
}
