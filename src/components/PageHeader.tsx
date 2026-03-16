import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
