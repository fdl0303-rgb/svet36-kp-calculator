declare module 'pdfmake/build/pdfmake' {
  interface PdfMakeStatic {
    fonts?: Record<string, unknown>
    vfs?: Record<string, string>
    addVirtualFileSystem?: (vfs: Record<string, string>) => void
    createPdf: (doc: unknown) => { download: (filename?: string) => void; open: () => void }
  }
  const pdfMake: PdfMakeStatic
  export default pdfMake
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>
  export default vfs
}
