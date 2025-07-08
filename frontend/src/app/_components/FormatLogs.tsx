import { useState } from 'react';

// Function to format logs with better styling
export const FormatLogs = (logs: string) => {
  // Split by common delimiters and format
  const formatLine = (line: string) => {
    // Check if it's a key-value pair
    const keyValueRegex = /^'([^']+)':\s*'?([^',}]+)'?,?\s*$/;
    const match = keyValueRegex.exec(line);

    if (match) {
      const [, key, value] = match;
      return (
        <div className="mb-1" key={key}>
          <span className="font-bold text-blue-700">{key}:</span>{" "}
          <span className="text-slate-800">{value}</span>
        </div>
      );
    }

    // Check for SQL keywords
    const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
    let formattedLine = line;

    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formattedLine = formattedLine.replace(regex, `**${keyword}**`);
    });

    // Convert **text** to bold
    const parts = formattedLine.split(/(\*\*[^*]+\*\*)/);

    return (
      <div className="mb-1" key={Math.random()}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={index} className="font-bold text-purple-700">
                {part.slice(2, -2)}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  // Composant pour une section collapsible
  const CollapsibleSection = ({ section, sectionIndex }: { section: string; sectionIndex: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Extraire la première ligne pour le preview
    const firstLine = section.split('\n')[0] ?? section.substring(0, 100) + '...';
    
    return (
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
        <div 
          className="p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-blue-600">
                {isExpanded ? '🔽' : '▶️'}
              </span>
              <span className="font-bold text-blue-800">📄 Section {sectionIndex + 1}</span>
            </div>
            <span className="text-xs text-blue-600">
              {isExpanded ? 'Click to collapse' : 'Click to expand'}
            </span>
          </div>
          <div className="mt-2 text-sm text-blue-700 font-mono">
            {firstLine}
          </div>
        </div>
        
        {isExpanded && (
          <div className="border-t border-blue-300 bg-white p-4">
            {processSectionContent(section.trim())}
          </div>
        )}
      </div>
    );
  };

  // Split logs into structured parts
const processLogs = (text: string) => {
  // D'abord découper par les séparateurs ─
  const sectionSeparator = /─+/g; // Matches one or more ─ characters
  const sections = text.split(sectionSeparator);

  return sections.map((section, sectionIndex) => {
    if (!section.trim()) return null; // Skip empty sections

    // Inverser l'ordre des lignes dans chaque section
    const reversedSection = section
      .split('\n')
      .reverse()
      .join('\n');

    return (
      <CollapsibleSection 
        key={sectionIndex} 
        section={reversedSection} 
        sectionIndex={sectionIndex} 
      />
    );
  }).filter(Boolean); // Remove null values
};

  // Nouvelle fonction pour traiter le contenu de chaque section
  const processSectionContent = (text: string) => {
    // Split by objects (patterns like {...})
    const objectPattern = /(\{[^}]+\})/g;
    const parts = text.split(objectPattern);

    return parts.map((part, index) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        // Process object content
        const objectContent = part.slice(1, -1);
        const pairs = objectContent.split(/', '/);

        return (
          <div key={index} className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 font-semibold text-slate-700">📦 Data Object:</div>
            {pairs.map((pair, pairIndex) => {
              const cleaned = pair.replace(/^'|'$/g, '');
              return formatLine(cleaned);
            })}
          </div>
        );
      } else {
        // Process regular text
        const lines = part.split('\n').filter(line => line.trim());
        return (
          <div key={index}>
            {lines.map((line, lineIndex) => formatLine(line.trim()))}
          </div>
        );
      }
    });
  };

  return <div>{processLogs(logs)}</div>;
};