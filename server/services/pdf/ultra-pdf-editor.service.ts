export class UltraPDFEditorService {
  async editPDF(pdfData: any, edits: any) {
    return { success: true, pdf: pdfData, message: 'PDF editor service not configured' };
  }
}
