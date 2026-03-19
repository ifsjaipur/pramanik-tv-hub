import { NextRequest, NextResponse } from 'next/server';
import { getArticlesBySection, getArticleBySlug } from '@/lib/cms';

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section');
  const slug = req.nextUrl.searchParams.get('slug');

  if (slug) {
    const article = await getArticleBySlug(slug);
    if (!article) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(article);
  }

  if (section) {
    const articles = await getArticlesBySection(section);
    return NextResponse.json(articles);
  }

  return NextResponse.json([], { status: 400 });
}
