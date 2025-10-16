import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const CONTENT_DIR = path.join(process.cwd(), "content/blog");

// Ensure content directory exists
if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

/**
 * Generate a slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Check if a file with the given slug already exists
 */
function fileExists(slug: string): boolean {
  const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  return fs.existsSync(mdxPath) || fs.existsSync(mdPath);
}

/**
 * Validate MDX frontmatter
 */
function validateFrontmatter(data: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push("Missing or invalid 'title' field");
  }

  if (!data.date || typeof data.date !== "string") {
    errors.push("Missing or invalid 'date' field");
  }

  if (!data.description || typeof data.description !== "string") {
    errors.push("Missing or invalid 'description' field");
  }

  if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push("Missing or invalid 'tags' field (must be an array)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * POST /api/blog/webhook
 * Create a new blog post from MDX content
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook is not configured on server" },
        { status: 500 }
      );
    }

    if (!token || token !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'content' field in request body" },
        { status: 400 }
      );
    }

    // 3. Parse MDX content
    let parsedContent;
    try {
      parsedContent = matter(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid MDX format: Unable to parse frontmatter" },
        { status: 400 }
      );
    }

    const { data: frontmatter } = parsedContent;

    // 4. Validate frontmatter
    const validation = validateFrontmatter(frontmatter);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid frontmatter",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 5. Generate slug
    const slug = generateSlug(frontmatter.title);

    // 6. Check if file already exists
    if (fileExists(slug)) {
      return NextResponse.json(
        {
          error: "A post with this title already exists",
          slug,
        },
        { status: 409 }
      );
    }

    // 7. Write MDX file
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    try {
      fs.writeFileSync(filePath, content, "utf8");
    } catch (error) {
      console.error("Error writing file:", error);
      return NextResponse.json(
        { error: "Failed to write blog post file" },
        { status: 500 }
      );
    }

    // 8. Return success response
    const postUrl = `/blog/${slug}`;
    return NextResponse.json(
      {
        success: true,
        message: "Blog post created successfully",
        slug,
        url: postUrl,
        title: frontmatter.title,
        date: frontmatter.date,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Blog webhook endpoint is active",
    configured: !!WEBHOOK_SECRET,
  });
}
