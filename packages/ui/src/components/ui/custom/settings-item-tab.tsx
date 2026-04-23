interface SettingItemTabProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingItemTab({
  title,
  description,
  children,
}: SettingItemTabProps) {
  return (
    <>
      <div className="grid">
        <div className="font-bold">{title}</div>
        {description && (
          <div className="whitespace-pre-line font-semibold text-muted-foreground text-sm">
            {description}
          </div>
        )}

        <div className="my-2">{children}</div>
      </div>
    </>
  );
}
