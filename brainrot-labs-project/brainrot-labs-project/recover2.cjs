const fs = require('fs');

async function recover() {
  const content = fs.readFileSync('src/components/customizer/ProductCustomizer.tsx', 'utf8');
  // the first block is exactly lines 1 to 29. Let's find the first char 'i'
  // Actually, wait, reading 191MB in Node might take ~200MB memory, which is completely fine! Node allows up to 1.5GB!
  // Let's just do it in memory.
  
  console.log('File size:', content.length);
  
  // The first 29 lines is the snippet. But wait, line 1 is `                <div...`
  // The user replaced empty strings. So the snippet is inserted before and after every character.
  // We can just find the snippet by looking at the start of the file.
  // The file starts with the snippet! 
  
  const snippetEndIndex = content.indexOf('i                <div className="space-y-6">');
  if (snippetEndIndex === -1) {
    console.log('Snippet end not found!');
    return;
  }
  
  const snippet = content.slice(0, snippetEndIndex);
  console.log('Snippet length:', snippet.length);
  
  // Now replace all occurrences of `snippet` with empty string.
  // Using split.join is the fastest way in V8.
  const recovered = content.split(snippet).join('');
  
  fs.writeFileSync('src/components/customizer/ProductCustomizer.recovered.tsx', recovered);
  console.log('Recovered file written, size:', recovered.length);
}
recover();
