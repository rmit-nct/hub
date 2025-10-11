import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import { cn } from '@ncthub/utils/format';

interface TimelineCardProps {
  year: string;
  title: string;
  description: string;
  isSelected: boolean;
}

export function TimelineCard({
  year,
  title,
  description,
  isSelected,
}: TimelineCardProps) {
  return (
    <Card
      className={cn(
        'border-border/50 bg-card/80 relative h-full overflow-hidden border-2 shadow-lg',
        'transition-all duration-500 ease-in-out hover:shadow-xl',
        isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-60',
        'mx-auto w-full max-w-md py-4 md:py-8 lg:max-w-lg'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 transition-all duration-500',
          isSelected ? 'bg-transparent' : 'bg-muted/60'
        )}
      />
      <CardHeader className="items-center gap-4">
        <div className="from-brand-light-blue to-brand-light-yellow flex size-20 items-center justify-center rounded-full bg-gradient-to-br p-1 shadow-md md:size-24 lg:size-28">
          <div className="border-brand-light-blue/20 bg-card flex size-full items-center justify-center rounded-full border-2">
            <p className="text-brand-dark-blue text-lg font-bold md:text-xl">
              {year}
            </p>
          </div>
        </div>
        <CardTitle className="text-card-foreground text-center text-lg font-bold md:text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground text-center text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
