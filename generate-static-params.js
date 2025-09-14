// generate-static-params.js
// This script helps identify all dynamic routes that need generateStaticParams

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directory for the app router
const appDir = path.join(__dirname, 'app');

// Find all dynamic routes ([param]) in the app directory
function findDynamicRoutes(dir, routePrefix = '') {
  const dynamicRoutes = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    const routePath = `${routePrefix}/${item.name}`;

    if (item.isDirectory()) {
      // This is a dynamic route parameter
      if (item.name.startsWith('[') && item.name.endsWith(']')) {
        // Check if it has route.js or route.ts file
        const routeFile = fs.existsSync(path.join(itemPath, 'route.js')) 
          ? path.join(itemPath, 'route.js') 
          : fs.existsSync(path.join(itemPath, 'route.ts')) 
            ? path.join(itemPath, 'route.ts')
            : null;

        if (routeFile) {
          // Check if file already has generateStaticParams
          const content = fs.readFileSync(routeFile, 'utf8');
          if (!content.includes('generateStaticParams')) {
            dynamicRoutes.push({
              path: routePath,
              filePath: routeFile,
              paramName: item.name.slice(1, -1) // Remove the brackets
            });
          }
        }
      }
      
      // Recursively check subdirectories
      const nestedRoutes = findDynamicRoutes(itemPath, routePath);
      dynamicRoutes.push(...nestedRoutes);
    }
  }

  return dynamicRoutes;
}

// Add generateStaticParams to route files
function addGenerateStaticParams(routes) {
  for (const route of routes) {
    console.log(`Adding generateStaticParams to: ${route.path}`);
    
    const content = fs.readFileSync(route.filePath, 'utf8');
    
    // Add imports if not already present
    let updatedContent = content;
    if (!content.includes('isStaticBuild')) {
      const importStatement = `import { isStaticBuild } from '@/lib/api-utils';\n\n`;
      updatedContent = importStatement + updatedContent;
    }
    
    // Add dynamic directive if not present
    if (!content.includes('export const dynamic')) {
      updatedContent = updatedContent.replace(
        /import.*?;\n\n/s, 
        match => `${match}// Force dynamic for development server\nexport const dynamic = 'force-dynamic';\n\n`
      );
    }
    
    // Add generateStaticParams function
    if (!content.includes('generateStaticParams')) {
      updatedContent = updatedContent.replace(
        /export async function|export function|export const/,
        `// Generate static parameters for build\nexport async function generateStaticParams() {\n  // During static build, we provide a list of IDs to pre-render\n  return [\n    { ${route.paramName}: '1' },\n    { ${route.paramName}: '2' },\n    { ${route.paramName}: '3' }\n  ];\n}\n\n$&`
      );
    }
    
    // Add static build check to handlers
    const handlers = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      .filter(method => updatedContent.includes(`export async function ${method}`));
    
    for (const method of handlers) {
      if (!updatedContent.includes(`if (isStaticBuild())`)) {
        const mockDataBlock = `  // During static build, return mock data\n  if (isStaticBuild()) {\n    return NextResponse.json({\n      id: params.${route.paramName},\n      message: "Static build mock response for ${route.path}"\n    });\n  }\n\n`;
        
        updatedContent = updatedContent.replace(
          new RegExp(`export async function ${method}[\\s\\S]*?{\\n`),
          match => `${match}${mockDataBlock}`
        );
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(route.filePath, updatedContent);
  }
}

// Main function
function main() {
  const dynamicRoutes = findDynamicRoutes(appDir);
  console.log(`Found ${dynamicRoutes.length} dynamic routes without generateStaticParams`);
  
  if (dynamicRoutes.length > 0) {
    addGenerateStaticParams(dynamicRoutes);
    console.log('All routes updated successfully!');
  }
}

// Run the script
main();