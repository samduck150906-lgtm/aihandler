import { Metadata } from 'next';
import Link from 'next/link';
import { AI_TOOLS } from '@/lib/data/ai-tools';
import { notFound } from 'next/navigation';
import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return AI_TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = AI_TOOLS.find((t) => t.slug === params.slug);
  if (!tool) {
    return { title: "도구를 찾을 수 없습니다 | AI 핸들러" };
  }

  return {
    title: `${tool.name} 최적화 프롬프트 메이커 - AI 핸들러`,
    description: `${tool.name}(${tool.desc})의 성능을 200% 끌어올리는 맞춤형 프롬프트를 자동으로 조립해 보세요. 바로가기 혜택과 요금제 정보까지 한 번에 알려드립니다.`,
    alternates: {
      canonical: `https://aihandler.run/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} 프롬프트 자동 생성기`,
      description: `${tool.name}을(를) 위한 전문가 수준의 프롬프트를 단 3초 만에 만들어냅니다.`,
      url: `https://aihandler.run/tools/${tool.slug}`,
      type: 'article',
    }
  };
}

export default function ToolLandingPage({ params }: Props) {
  const tool = AI_TOOLS.find((t) => t.slug === params.slug);

  if (!tool) {
    notFound();
  }

  // Schema Markup (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "description": tool.desc,
    "offers": {
      "@type": "Offer",
      "price": tool.price === "무료" ? "0" : "Paid",
      "priceCurrency": "KRW"
    }
  };

  return (
    <article className="min-h-screen bg-[#FAFAF8] dark:bg-zinc-950 flex flex-col items-center py-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl w-full bg-white dark:bg-zinc-900 border-[3px] border-ink dark:border-zinc-800 shadow-[8px_8px_0px_#1f2937] dark:shadow-[8px_8px_0px_#000] p-8 md:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-ink-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          메인 허브로 돌아가기
        </Link>

        <div className={`inline-flex px-3 py-1 text-xs font-black uppercase tracking-widest border-2 mb-4 ${tool.color.split(' ')[0]} ${tool.color.split(' ')[1]} ${tool.color.split(' ')[2]}`}>
          {tool.category}
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-ink dark:text-zinc-100 mb-4 tracking-tight">
          {tool.name} <span className="text-brand-500">프롬프트 조립기</span>
        </h1>
        
        <p className="text-lg md:text-xl font-bold text-ink-secondary dark:text-zinc-300 mb-10 leading-relaxed">
          {tool.desc}. 당신의 아이디어를 완벽한 {tool.name} 맞춤형 프롬프트 문장으로 단숨에 변환해 드립니다. 지금 바로 최고의 결과물을 뽑아내세요!
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-10 bg-surface-muted dark:bg-zinc-950 p-6 border-2 border-ink-faint dark:border-zinc-800">
          <div>
            <h3 className="text-xs font-black text-ink-muted dark:text-zinc-500 uppercase tracking-widest mb-1">가격 정책</h3>
            <p className="font-bold text-ink dark:text-zinc-200">{tool.price}</p>
          </div>
          <div>
            <h3 className="text-xs font-black text-ink-muted dark:text-zinc-500 uppercase tracking-widest mb-1">바로가기</h3>
            <a href={tool.signUpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline">
              {tool.name} 공식 홈페이지 <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            href={`/?tool=${tool.slug}`}
            className="w-full flex justify-center items-center py-5 px-6 border-[3px] border-ink dark:border-zinc-800 font-black text-xl tracking-wide bg-brand-400 dark:bg-brand-500 text-ink dark:text-zinc-900 transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000]"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            프롬프트 조립 시작하기
          </Link>
        </div>
      </div>
    </article>
  );
}
