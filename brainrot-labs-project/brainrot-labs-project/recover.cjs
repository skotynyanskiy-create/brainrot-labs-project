const fs = require('fs');
const readline = require('readline');

async function recover() {
  const fileStream = fs.createReadStream('src/components/customizer/ProductCustomizer.tsx');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let recovered = '';
  for await (const line of rl) {
    lineCount++;
    if (lineCount % 29 === 1 && lineCount > 1) {
      recovered += line.charAt(0);
    }
  }
  fs.writeFileSync('src/components/customizer/ProductCustomizer.recovered.tsx', recovered);
  console.log('Recovered length:', recovered.length);
}
recover();
