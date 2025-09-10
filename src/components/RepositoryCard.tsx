import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Repository } from '@/lib/alexandria-api';

interface RepositoryCardProps {
  repository: Repository;
  onSelect: (repo: Repository) => void;
}

export function RepositoryCard({ repository, onSelect }: RepositoryCardProps) {
  // Extract GitHub metadata from the nested github field
  const githubData = repository.github;
  const stars = githubData?.stars || 0;
  const owner = githubData?.owner || 'unknown';
  const description = githubData?.description;
  
  // Calculate spine width logarithmically based on chapter count
  // Base width is 20px (w-5), scales up to ~40px for many chapters
  const chapters = repository.viewCount || 0;
  const spineWidth = Math.min(40, Math.max(20, 20 + Math.log(chapters + 1) * 5));
  
  return (
    <div 
      className="group relative cursor-pointer h-[420px] w-full max-w-[320px] mx-auto"
      onClick={() => onSelect(repository)}
    >
      {/* Book container with 3D effect */}
      <div className="relative h-full w-full transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
        {/* Book spine (left side) */}
        <div 
          className="absolute left-0 top-0 h-full bg-green-800 dark:bg-green-900 rounded-l-sm shadow-lg"
          style={{ width: `${spineWidth}px` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent rounded-l-sm"></div>
          {/* Spine embossing effect */}
          <div className="absolute top-4 bottom-4 left-1 w-0.5 bg-green-700 dark:bg-green-950"></div>
          <div className="absolute top-4 bottom-4 right-1 w-0.5 bg-green-700 dark:bg-green-950"></div>
          
          {/* Stars indicator on spine */}
          {stars > 100 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <div className="text-[8px] text-yellow-500 font-bold mt-0.5">
                {stars >= 1000 ? `${(stars / 1000).toFixed(0)}k` : stars}
              </div>
            </div>
          )}
        </div>
        
        {/* Main book body */}
        <Card 
          className="h-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-950/30 shadow-xl transition-shadow group-hover:shadow-2xl rounded-l-none border-r-0"
          style={{ 
            marginLeft: `${spineWidth}px`,
            width: `calc(100% - ${spineWidth}px)`
          }}
        >
          {/* Book top edge */}
          <div className="absolute -top-1 left-0 right-2 h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-sm"></div>
          
          {/* Subtle page edges on right */}
          <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-l from-gray-300 to-transparent dark:from-gray-700 rounded-r-lg"></div>

          <CardHeader className="pt-8 pb-4 px-6">
            <div className="space-y-3">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold leading-tight line-clamp-2">{repository.name}</CardTitle>
                <p className="text-base text-muted-foreground mt-2 italic">by {owner}</p>
              </div>
              {description && (
                <CardDescription className="text-base leading-relaxed line-clamp-4 mt-4 text-center">
                  {description}
                </CardDescription>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6 space-y-3">
            {githubData?.topics && githubData.topics.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {githubData.topics.slice(0, 4).map(topic => (
                  <Badge key={topic} variant="secondary" className="text-sm">{topic}</Badge>
                ))}
                {githubData.topics.length > 4 && (
                  <Badge variant="outline" className="text-sm">+{githubData.topics.length - 4}</Badge>
                )}
              </div>
            )}
          </CardContent>
          
          {/* License badge positioned at absolute bottom left of card */}
          {githubData?.license && (
            <div 
              className="absolute bottom-4"
              style={{ left: `${spineWidth + 16}px` }}
            >
              <div className="inline-flex items-center gap-1.5 bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                {githubData.license}
              </div>
            </div>
          )}
          
          {/* Chapter badge positioned at absolute bottom right of card */}
          {repository.hasViews && (
            <div className="absolute bottom-4 right-4">
              <div className="inline-flex items-center gap-1.5 bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                {repository.viewCount} {repository.viewCount === 1 ? 'Chapter' : 'Chapters'}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}