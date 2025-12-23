#!/usr/bin/env ts-node

/**
 * generate-docs - Generates GitBook-formatted documentation from contracts and tests
 *
 * Usage: ts-node scripts/generate-docs.ts <example-name> [options]
 *
 * Example: ts-node scripts/generate-docs.ts privacy-compliance-audit --output docs/
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

// Documentation configuration interface
interface DocsConfig {
  title: string;
  description: string;
  contract: string;
  test: string;
  output: string;
  category: string;
}

// Example configurations
const EXAMPLES_CONFIG: Record<string, DocsConfig> = {
  'privacy-compliance-audit': {
    title: 'Privacy Compliance Audit',
    description: 'This example demonstrates a privacy-preserving compliance audit system using FHEVM. It supports multiple compliance standards (GDPR, HIPAA, CCPA, SOX, PCI-DSS, ISO27001) with encrypted scoring, risk assessment, and access control.',
    contract: 'contracts/PrivacyComplianceAudit.sol',
    test: 'test/PrivacyComplianceAudit.test.ts',
    output: 'docs/privacy-compliance-audit.md',
    category: 'Advanced',
  },
  'fhe-counter': {
    title: 'FHE Counter',
    description: 'This example demonstrates how to build a confidential counter using FHEVM, in comparison to a simple counter.',
    contract: 'contracts/FHECounter.sol',
    test: 'test/FHECounter.test.ts',
    output: 'docs/fhe-counter.md',
    category: 'Basic',
  },
  'fhe-add': {
    title: 'FHE Add Operation',
    description: 'This example demonstrates how to perform addition operations on encrypted values.',
    contract: 'contracts/FHEAdd.sol',
    test: 'test/FHEAdd.test.ts',
    output: 'docs/fhe-add.md',
    category: 'Basic',
  },
  'fhe-eq': {
    title: 'FHE Equality Comparison',
    description: 'This example demonstrates how to perform equality comparison operations on encrypted values.',
    contract: 'contracts/FHEEq.sol',
    test: 'test/FHEEq.test.ts',
    output: 'docs/fhe-eq.md',
    category: 'Basic',
  },
};

function readFile(filePath: string): string {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function getContractName(content: string): string {
  const match = content.match(/^\s*contract\s+(\w+)(?:\s+is\s+|\s*\{)/m);
  return match ? match[1] : 'Contract';
}

function extractDescription(content: string): string {
  // Extract description from first multi-line comment or @notice
  const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
  const noticeMatch = content.match(/@notice\s+(.+)/);

  return commentMatch ? commentMatch[1] : (noticeMatch ? noticeMatch[1] : '');
}

function generateGitBookMarkdown(config: DocsConfig, contractContent: string, testContent: string): string {
  const contractName = getContractName(contractContent);
  const description = config.description || extractDescription(contractContent);

  let markdown = `# ${config.title}\n\n`;
  markdown += `${description}\n\n`;

  // Add hint block
  markdown += `{% hint style="info" %}\n`;
  markdown += `To run this example correctly, make sure the files are placed in the following directories:\n\n`;
  markdown += `- \`.sol\` file → \`<your-project-root-dir>/contracts/\`\n`;
  markdown += `- \`.ts\` file → \`<your-project-root-dir>/test/\`\n\n`;
  markdown += `This ensures Hardhat can compile and test your contracts as expected.\n`;
  markdown += `{% endhint %}\n\n`;

  // Add tabs for contract and test
  markdown += `{% tabs %}\n\n`;

  // Contract tab
  markdown += `{% tab title="${contractName}.sol" %}\n\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += contractContent;
  markdown += `\n\`\`\`\n\n`;
  markdown += `{% endtab %}\n\n`;

  // Test tab
  const testFileName = path.basename(config.test);
  markdown += `{% tab title="${testFileName}" %}\n\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += testContent;
  markdown += `\n\`\`\`\n\n`;
  markdown += `{% endtab %}\n\n`;

  markdown += `{% endtabs %}\n`;

  return markdown;
}

function updateSummary(exampleName: string, config: DocsConfig): void {
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const summaryPath = path.join(docsDir, 'SUMMARY.md');

  if (!fs.existsSync(summaryPath)) {
    log('Creating new SUMMARY.md', Color.Yellow);
    const summary = `# Summary\n\n## Table of Contents\n\n`;
    fs.writeFileSync(summaryPath, summary);
  }

  const summary = fs.readFileSync(summaryPath, 'utf-8');
  const outputFileName = path.basename(config.output);
  const linkText = config.title;
  const link = `- [${linkText}](${outputFileName})`;

  // Check if already in summary
  if (summary.includes(outputFileName)) {
    info('Example already in SUMMARY.md');
    return;
  }

  // Add to appropriate category
  const categoryHeader = `## ${config.category}`;
  let updatedSummary: string;

  if (summary.includes(categoryHeader)) {
    // Add under existing category
    const lines = summary.split('\n');
    const categoryIndex = lines.findIndex(line => line.includes(categoryHeader));
    lines.splice(categoryIndex + 1, 0, link);
    updatedSummary = lines.join('\n');
  } else {
    // Create new category
    updatedSummary = summary + `\n${categoryHeader}\n\n${link}\n`;
  }

  fs.writeFileSync(summaryPath, updatedSummary);
  success('Updated SUMMARY.md');
}

function generateDocs(exampleName: string, options: { output?: string; noSummary?: boolean } = {}): void {
  if (!EXAMPLES_CONFIG[exampleName]) {
    error(`Unknown example: ${exampleName}\n\nAvailable examples:\n${Object.keys(EXAMPLES_CONFIG).map(k => `  - ${k}`).join('\n')}`);
  }

  const config = EXAMPLES_CONFIG[exampleName];

  info(`Generating documentation for: ${config.title}`);

  // Read contract and test files
  log('\n📖 Reading source files...', Color.Cyan);
  const contractContent = readFile(config.contract);
  const testContent = readFile(config.test);
  success('Source files read');

  // Generate markdown
  log('\n📝 Generating GitBook markdown...', Color.Cyan);
  const markdown = generateGitBookMarkdown(config, contractContent, testContent);
  success('Markdown generated');

  // Create docs directory if it doesn't exist
  const outputPath = options.output || config.output;
  const outputDir = path.dirname(path.join(process.cwd(), outputPath));

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write documentation file
  log('\n💾 Writing documentation file...', Color.Cyan);
  fs.writeFileSync(path.join(process.cwd(), outputPath), markdown);
  success(`Documentation written to: ${outputPath}`);

  // Update SUMMARY.md
  if (!options.noSummary) {
    log('\n📚 Updating SUMMARY.md...', Color.Cyan);
    updateSummary(exampleName, config);
  }

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`Documentation generated successfully!`);
  log('='.repeat(60), Color.Green);

  log(`\n📄 Output file: ${outputPath}`, Color.Cyan);
}

function generateAllDocs(): void {
  info('Generating documentation for all examples...\n');

  const examples = Object.keys(EXAMPLES_CONFIG);
  examples.forEach((exampleName, index) => {
    log(`\n[${index + 1}/${examples.length}] Processing: ${exampleName}`, Color.Yellow);
    try {
      generateDocs(exampleName, { noSummary: true });
    } catch (err) {
      log(`⚠️  Warning: Failed to generate docs for ${exampleName}: ${err}`, Color.Yellow);
    }
  });

  // Update SUMMARY.md once at the end
  log('\n📚 Updating SUMMARY.md...', Color.Cyan);
  examples.forEach(exampleName => {
    try {
      updateSummary(exampleName, EXAMPLES_CONFIG[exampleName]);
    } catch (err) {
      log(`⚠️  Warning: Failed to update SUMMARY for ${exampleName}`, Color.Yellow);
    }
  });

  log('\n' + '='.repeat(60), Color.Green);
  success(`All documentation generated successfully!`);
  log('='.repeat(60), Color.Green);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Documentation Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/generate-docs.ts <example-name> [options]\n');
    log('Options:', Color.Yellow);
    log('  --output <path>    Specify output file path');
    log('  --no-summary       Skip updating SUMMARY.md');
    log('  --all              Generate docs for all examples');
    log('\nAvailable examples:', Color.Yellow);
    Object.entries(EXAMPLES_CONFIG).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.description.substring(0, 80)}...`, Color.Reset);
    });
    log('\nExample:', Color.Yellow);
    log('  ts-node scripts/generate-docs.ts privacy-compliance-audit\n');
    process.exit(0);
  }

  if (args[0] === '--all') {
    generateAllDocs();
    return;
  }

  const exampleName = args[0];
  const options: { output?: string; noSummary?: boolean } = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--no-summary') {
      options.noSummary = true;
    }
  }

  generateDocs(exampleName, options);
}

main();
