import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Repository } from '@/data/mockData';

interface RepositoryCardProps {
  repository: Repository;
  onSelect: (repo: Repository) => void;
}

export function RepositoryCard({ repository, onSelect }: RepositoryCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect(repository)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{repository.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{repository.owner}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">⭐ {repository.stars.toLocaleString()}</span>
          </div>
        </div>
        {repository.description && (
          <CardDescription className="mt-2">{repository.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {repository.hasViews && (
            <Badge variant="default">Has Views</Badge>
          )}
          {repository.hasDocs && (
            <Badge variant="secondary">Has Docs</Badge>
          )}
        </div>
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(repository);
            }}
          >
            Browse Views →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}