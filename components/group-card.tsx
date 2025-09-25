interface GroupCardProps {
  title: string
  description: string
  focusAreas: string[]
  technologies: string
}

function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export function GroupCard({ title, description, focusAreas, technologies }: GroupCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-2xl font-semibold text-foreground mb-3">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-foreground mb-2">Key Focus Areas:</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          {focusAreas.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>
      <div className="text-sm">
        <span className="font-medium text-foreground">Technologies: </span>
        <span className="text-muted-foreground">{renderTextWithLinks(technologies)}</span>
      </div>
    </div>
  )
}
