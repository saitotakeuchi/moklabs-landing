#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Validates that all required environment variables are set
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_VARS = [
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'TO_EMAIL',
];

// Optional but recommended environment variables
const RECOMMENDED_VARS = [
  'NEXT_PUBLIC_GA_TRACKING_ID',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SITE_NAME',
  'FROM_NAME',
];

console.log('🔍 Checking Environment Variables...\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envLocalPath)) {
  console.log(chalk.yellow('⚠️  .env.local file not found!'));

  if (fs.existsSync(envExamplePath)) {
    console.log(chalk.blue('💡 Copy .env.example to .env.local and configure it:'));
    console.log(chalk.gray('   cp .env.example .env.local\n'));
  }
} else {
  console.log(chalk.green('✅ .env.local file found\n'));
}

// Load environment variables
require('dotenv').config({ path: envLocalPath });

let missingRequired = [];
let missingRecommended = [];

// Check required variables
console.log(chalk.bold('Required Variables:'));
REQUIRED_VARS.forEach((varName) => {
  if (process.env[varName]) {
    const value = process.env[varName];
    const maskedValue = value.substring(0, 4) + '*'.repeat(Math.min(value.length - 4, 10));
    console.log(chalk.green(`  ✅ ${varName}: ${maskedValue}`));
  } else {
    console.log(chalk.red(`  ❌ ${varName}: NOT SET`));
    missingRequired.push(varName);
  }
});

console.log('');

// Check recommended variables
console.log(chalk.bold('Recommended Variables:'));
RECOMMENDED_VARS.forEach((varName) => {
  if (process.env[varName]) {
    let value = process.env[varName];
    // Don't mask public variables
    if (!varName.startsWith('NEXT_PUBLIC_')) {
      value = value.substring(0, 4) + '*'.repeat(Math.min(value.length - 4, 10));
    }
    console.log(chalk.green(`  ✅ ${varName}: ${value}`));
  } else {
    console.log(chalk.yellow(`  ⚠️  ${varName}: NOT SET`));
    missingRecommended.push(varName);
  }
});

console.log('');

// Summary
if (missingRequired.length === 0 && missingRecommended.length === 0) {
  console.log(chalk.green.bold('✅ All environment variables are configured!'));
  process.exit(0);
} else {
  if (missingRequired.length > 0) {
    console.log(chalk.red.bold('❌ Missing required variables:'));
    missingRequired.forEach((varName) => {
      console.log(chalk.red(`   - ${varName}`));
    });
    console.log('');
  }

  if (missingRecommended.length > 0) {
    console.log(chalk.yellow.bold('⚠️  Missing recommended variables:'));
    missingRecommended.forEach((varName) => {
      console.log(chalk.yellow(`   - ${varName}`));
    });
    console.log('');
  }

  console.log(chalk.blue('📖 See .env.example for configuration instructions'));

  if (missingRequired.length > 0) {
    process.exit(1);
  }
}
