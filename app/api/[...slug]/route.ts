import { NextRequest, NextResponse } from 'next/server';
import { isStaticBuild, getMockData } from '@/lib/api-utils';

// Add force-dynamic directive to prevent static generation errors
export const dynamic = 'force-dynamic';

// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { slug: ['api', 'auth', 'session'] },
    { slug: ['api', 'admin', 'dashboard-stats'] },
    { slug: ['api', 'doctor', 'profile'] }
  ];
}

// This is a catch-all route for API requests during static export
// It ensures that dynamic API requests don't fail during build
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  // Reconstruct the API path from the slug
  const apiPath = `/api/${params.slug.join('/')}`;
  console.log(`Static build: Handling ${apiPath}`);

  return NextResponse.json(
    getMockData(apiPath),
    { status: 200 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const apiPath = `/api/${params.slug.join('/')}`;
  console.log(`Static build: Handling POST to ${apiPath}`);

  return NextResponse.json(
    getMockData(apiPath) || {
      success: true,
      message: 'Mock POST response for static build',
      path: apiPath
    },
    { status: 200 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const apiPath = `/api/${params.slug.join('/')}`;
  console.log(`Static build: Handling PUT to ${apiPath}`);

  return NextResponse.json(
    getMockData(apiPath) || {
      success: true,
      message: 'Mock PUT response for static build',
      path: apiPath
    },
    { status: 200 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const apiPath = `/api/${params.slug.join('/')}`;
  console.log(`Static build: Handling DELETE to ${apiPath}`);

  return NextResponse.json(
    getMockData(apiPath) || {
      success: true,
      message: 'Mock DELETE response for static build',
      path: apiPath
    },
    { status: 200 }
  );
}