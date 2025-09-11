#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

console.log('Building Alexandria Outpost server...');

// Ensure dist directory exists
const distDir = path.join(projectRoot, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create the CLI entry point
const cliContent = `#!/usr/bin/env node
import { program } from 'commander';
import { startServer } from './server.js';
import chalk from 'chalk';
import open from 'open';

program
  .name('alexandria-outpost')
  .description('Local UI for browsing Alexandria repository documentation')
  .version('0.1.6');

program
  .command('serve')
  .description('Start the Alexandria Outpost server')
  .option('-p, --port <port>', 'Port to run the server on', '3003')
  .option('--api-url <url>', 'Alexandria API URL', 'https://git-gallery.com')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options) => {
    const port = parseInt(options.port);
    const apiUrl = options.apiUrl;
    
    console.log(chalk.blue('🏛️  Starting Alexandria Outpost...'));
    console.log(chalk.gray(\`   Port: \${port}\`));
    console.log(chalk.gray(\`   API: \${apiUrl}\`));
    
    await startServer({ port, apiUrl });
    
    const localUrl = \`http://localhost:\${port}\`;
    console.log(chalk.green(\`✨ Alexandria Outpost is running at \${localUrl}\`));
    
    if (options.open) {
      console.log(chalk.gray('   Opening browser...'));
      await open(localUrl);
    }
  });

program.parse();
`;

fs.writeFileSync(path.join(distDir, 'cli.js'), cliContent);

// Create the server module
const serverContent = `import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function startServer({ port = 3003, apiUrl = 'https://git-gallery.com' }) {
  const app = express();
  
  const publicPath = path.join(__dirname, '..', 'outpost-dist');
  
  // Handle HTML files with configuration injection BEFORE static middleware
  app.get(['/', '/index.html'], (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    // Inject the API URL into the HTML
    const configScript = \`
      <script>
        window.ALEXANDRIA_CONFIG = {
          apiUrl: '\${apiUrl}'
        };
      </script>
    \`;
    
    html = html.replace('</head>', \`\${configScript}</head>\`);
    res.send(html);
  });
  
  // Handle repo page separately
  app.get(['/repo', '/repo/index.html'], (req, res) => {
    const repoPath = path.join(publicPath, 'repo', 'index.html');
    let html = fs.readFileSync(repoPath, 'utf-8');
    
    // Inject the API URL into the HTML
    const configScript = \`
      <script>
        window.ALEXANDRIA_CONFIG = {
          apiUrl: '\${apiUrl}'
        };
      </script>
    \`;
    
    html = html.replace('</head>', \`\${configScript}</head>\`);
    res.send(html);
  });
  
  // Serve static files (JS, CSS, images, etc.) but NOT HTML files
  app.use(express.static(publicPath, {
    index: false,  // Don't serve index.html automatically
    extensions: ['js', 'css', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'json', 'woff', 'woff2', 'ttf', 'eot']
  }));
  
  // Fallback for any other routes (client-side routing)
  app.use((req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    // Inject the API URL into the HTML
    const configScript = \`
      <script>
        window.ALEXANDRIA_CONFIG = {
          apiUrl: '\${apiUrl}'
        };
      </script>
    \`;
    
    html = html.replace('</head>', \`\${configScript}</head>\`);
    res.send(html);
  });
  
  return new Promise((resolve) => {
    app.listen(port, () => {
      resolve(app);
    });
  });
}

// Allow running directly
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const port = process.env.PORT || 3003;
  const apiUrl = process.env.ALEXANDRIA_API_URL || 'https://git-gallery.com';
  startServer({ port, apiUrl });
}
`;

fs.writeFileSync(path.join(distDir, 'server.js'), serverContent);

// Make CLI executable
fs.chmodSync(path.join(distDir, 'cli.js'), '755');

console.log('✅ Server build complete!');