import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
