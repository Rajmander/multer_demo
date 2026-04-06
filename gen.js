import PDFDocument from "pdfkit";

export function generatePdfBuffer({ name, email, date, items }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    // Collect PDF data in memory
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // ----- PDF Content -----
    doc.fontSize(20).text("Invoice / Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Date: ${date}`);
    doc.moveDown();

    doc.text("Items:", { underline: true });
    items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.description} - $${item.amount.toFixed(2)}`);
    });

    const total = items.reduce((sum, item) => sum + item.amount, 0);
    doc.moveDown();
    doc.fontSize(16).text(`Total: $${total.toFixed(2)}`, { bold: true });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text("Thank you for your business!", { align: "center" });

    // End PDF
    doc.end();
  });
}

//
