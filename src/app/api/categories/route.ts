import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// GET /api/categories - List all categories with course count
export async function GET() {
  try {
    const categories = await getAllCategories();

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error",
        categories: [],
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await createCategory({
      name: body.name,
      description: body.description,
      icon: body.icon,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
