const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function main() {
  const pdfPath = path.resolve(__dirname, '..', '..', 'UPLOADS', 'Art Company - Catalogo (Completo).pdf');
  const dataBuffer = fs.readFileSync(pdfPath);

  const data = await pdf(dataBuffer, {
    max: 5, // tenta extrair apenas as primeiras páginas (nem sempre é respeitado por todos parsers)
  });

  const text = (data.text || '').trim();

  console.log('--- PDF PROBE ---');
  console.log('Pages (reported):', data.numpages);
  console.log('Text length:', text.length);
  console.log('Sample:\n');
  console.log(text.slice(0, 2000));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
