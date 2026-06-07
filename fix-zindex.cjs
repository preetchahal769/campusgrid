const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app'));
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Find <div className="... bg-background ..."> where there's an absolute -z-10 header inside
  // It's usually the first div returned.
  
  // The simplest way:
  // Replace <div className="min-h-screen bg-background pb-12">
  // with <div className="min-h-screen pb-12 relative z-0">
  
  // More general regex:
  // We want to replace `bg-background` with `relative z-0` on the root container, but ONLY if the file has an absolute -z-10 element.
  if (content.includes('-z-10') && (content.includes('bg-[#0A4EA6]') || content.includes('rounded-b-[3rem]'))) {
    content = content.replace(/<div className="(flex flex-col )?min-h-screen bg-background (pb-\d+)?"/g, '<div className="$1min-h-screen $2 relative z-0"');
    content = content.replace(/<div className="(flex flex-col )?min-h-\[100dvh\] bg-background (relative )?(pb-\d+ )?text-foreground"/g, '<div className="$1min-h-[100dvh] relative z-0 $3text-foreground"');
    content = content.replace(/<div className="relative overflow-x-hidden min-h-full pb-10"/g, '<div className="relative overflow-x-hidden min-h-full pb-10 z-0"');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Updated ${changedFiles} files.`);
