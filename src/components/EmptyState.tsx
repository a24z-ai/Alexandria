import { useState } from 'react';

const features = [
  {
    id: 'uptodate',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    title: "Always Current",
    shortDescription: "Evolves with your code",
    fullTitle: "Always Up-to-Date",
    description: "Documentation evolves with your code. File anchors ensure docs stay relevant as your codebase grows."
  },
  {
    id: 'accessible',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Agent Accessible",
    shortDescription: "CLI & MCP ready",
    fullTitle: "Agent Accessible",
    description: "Access documentation through CLI tools and MCP servers. Your AI agents can query and navigate your codebase knowledge."
  },
  {
    id: 'history',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Version Tracked",
    shortDescription: "Full git history",
    fullTitle: "Version Tracked",
    description: "Documentation versioned in git alongside your code. Travel through time to see how your codebase and its documentation evolved."
  }
];

export function EmptyState() {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

  return (
    <div className="h-full flex items-center justify-center py-12">
      <div className="max-w-3xl px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-200 dark:text-gray-300">
            Agent Optimized Documentation
          </h2>
        </div>

        {/* Detailed view */}
        <div className="bg-card border border-border rounded-lg p-10 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-lg text-primary">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {selectedFeature.id === 'uptodate' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                )}
                {selectedFeature.id === 'accessible' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                )}
                {selectedFeature.id === 'history' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-200 dark:text-gray-300 mb-4">
            {selectedFeature.fullTitle}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl mx-auto">
            {selectedFeature.description}
          </p>
        </div>

        {/* Small cards row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature)}
              className={`p-4 rounded-lg border transition-all text-center ${
                selectedFeature.id === feature.id
                  ? 'bg-primary/10 border-primary shadow-sm'
                  : 'bg-card border-border hover:border-muted-foreground/50 hover:shadow-sm'
              }`}
            >
              <div className={`flex justify-center mb-2 ${
                selectedFeature.id === feature.id ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {feature.icon}
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${
                selectedFeature.id === feature.id ? 'text-gray-200 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-600">
                {feature.shortDescription}
              </p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-600">
            Select a view from the sidebar to explore how this codebase is organized and documented.
          </p>
        </div>
      </div>
    </div>
  );
}