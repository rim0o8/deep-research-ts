"use client";

interface MermaidDiagramProps {
  svg: string;
}

export function MermaidDiagram({ svg }: MermaidDiagramProps) {
  // eslint-disable-next-line react/no-danger
  return (
    <div className="my-4 rounded-lg overflow-hidden">
      <div 
        dangerouslySetInnerHTML={{ __html: svg }} 
        className="flex justify-center bg-white dark:bg-gray-900"
      />
    </div>
  );
} 