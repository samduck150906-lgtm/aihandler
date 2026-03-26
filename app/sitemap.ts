import { MetadataRoute } from 'next';
import { AI_TOOLS } from '@/lib/data/ai-tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aihandler.run';

  const toolPages = AI_TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...toolPages,
  ];
}
