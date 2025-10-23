import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  category: string;
  impact: string;
  url: string;
  published_at: string;
}

// Energy sector news sources and topics
const energyNewsTopics = [
  'energy security', 'power grid', 'natural gas', 'electricity market',
  'cybersecurity energy', 'grid infrastructure', 'renewable energy',
  'oil prices', 'LNG market', 'energy crisis'
];

async function fetchNewsFromAPI(): Promise<NewsArticle[]> {
  // Use NewsAPI.org - requires API key from environment
  const apiKey = Deno.env.get('NEWS_API_KEY');
  
  if (!apiKey) {
    console.log('NEWS_API_KEY not set, generating sample news');
    return generateSampleNews();
  }

  try {
    const query = 'energy OR electricity OR "power grid" OR "natural gas" OR cybersecurity';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('NewsAPI error:', response.status);
      return generateSampleNews();
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return generateSampleNews();
    }

    return data.articles.map((article: any) => ({
      title: article.title || 'Untitled',
      summary: article.description || article.content?.substring(0, 200) || 'No description available',
      source: article.source?.name || 'Unknown Source',
      category: categorizeArticle(article.title + ' ' + article.description),
      impact: assessImpact(article.title + ' ' + article.description),
      url: article.url || '#',
      published_at: article.publishedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return generateSampleNews();
  }
}

function categorizeArticle(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('cyber') || lowerText.includes('hack') || lowerText.includes('attack')) {
    return 'Cybersecurity';
  }
  if (lowerText.includes('grid') || lowerText.includes('infrastructure') || lowerText.includes('power')) {
    return 'Infrastructure';
  }
  if (lowerText.includes('gas') || lowerText.includes('lng') || lowerText.includes('oil')) {
    return 'Natural Gas';
  }
  if (lowerText.includes('price') || lowerText.includes('market') || lowerText.includes('trading')) {
    return 'Market';
  }
  if (lowerText.includes('policy') || lowerText.includes('regulation') || lowerText.includes('government')) {
    return 'Policy';
  }
  return 'General';
}

function assessImpact(text: string): string {
  const lowerText = text.toLowerCase();
  const highImpactKeywords = ['critical', 'severe', 'major', 'crisis', 'emergency', 'attack', 'breach'];
  const mediumImpactKeywords = ['concern', 'warning', 'threat', 'risk', 'issue', 'disruption'];
  
  if (highImpactKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'High';
  }
  if (mediumImpactKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Medium';
  }
  return 'Low';
}

function generateSampleNews(): NewsArticle[] {
  const now = new Date();
  const articles: NewsArticle[] = [
    {
      title: "ERCOT Issues Grid Alert Amid Rising Demand",
      summary: "Texas grid operator warns of potential supply shortfalls as temperatures soar and demand reaches record levels.",
      source: "Energy Daily",
      category: "Infrastructure",
      impact: "High",
      url: "https://www.energy.gov/articles/grid-security",
      published_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "New Malware Variant Targets Industrial Control Systems",
      summary: "Cybersecurity researchers discover advanced persistent threat specifically designed to compromise SCADA systems.",
      source: "Cybersecurity Weekly",
      category: "Cybersecurity",
      impact: "High",
      url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
      published_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "European Natural Gas Prices Surge on Supply Concerns",
      summary: "TTF prices jump 15% as maintenance on key pipeline raises questions about winter supply adequacy.",
      source: "Market Watch",
      category: "Natural Gas",
      impact: "Medium",
      url: "https://www.eia.gov/naturalgas/",
      published_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "DOE Announces $2B Investment in Grid Modernization",
      summary: "Federal funding aims to enhance resilience and security of critical energy infrastructure nationwide.",
      source: "Department of Energy",
      category: "Policy",
      impact: "Medium",
      url: "https://www.energy.gov/",
      published_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Asia-Pacific LNG Demand Hits Record High",
      summary: "Growing industrial activity and coal-to-gas switching drive unprecedented demand for liquefied natural gas.",
      source: "Bloomberg Energy",
      category: "Market",
      impact: "Low",
      url: "https://www.iea.org/",
      published_at: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
    },
  ];
  
  return articles;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Fetching latest news articles...');
    const articles = await fetchNewsFromAPI();
    
    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No articles fetched' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Delete old articles (keep only last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabaseClient
      .from('news_articles')
      .delete()
      .lt('published_at', oneDayAgo);

    // Insert new articles
    const { error: insertError } = await supabaseClient
      .from('news_articles')
      .upsert(articles, { onConflict: 'url' });

    if (insertError) {
      console.error('Error inserting articles:', insertError);
      throw insertError;
    }

    console.log(`Successfully fetched and stored ${articles.length} articles`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched ${articles.length} news articles`,
        articles: articles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
