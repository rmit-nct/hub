import { Mail } from '../data';
import { Avatar, AvatarFallback, AvatarImage } from '@ncthub/ui/avatar';
import { Button } from '@ncthub/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ncthub/ui/dropdown-menu';
import {
  Archive,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from '@ncthub/ui/icons';
import { Label } from '@ncthub/ui/label';
import { Separator } from '@ncthub/ui/separator';
import { Switch } from '@ncthub/ui/switch';
import { Textarea } from '@ncthub/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ncthub/ui/tooltip';
import { format } from 'date-fns';

interface MailDisplayProps {
  mail: Mail | null;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          {/*<Tooltip>*/}
          {/*  <TooltipTrigger asChild>*/}
          {/*    <Button variant="ghost" size="icon" disabled={!mail}>*/}
          {/*      <ArchiveX className="h-4 w-4" />*/}
          {/*      <span className="sr-only">Move to junk</span>*/}
          {/*    </Button>*/}
          {/*  </TooltipTrigger>*/}
          {/*  <TooltipContent>Move to junk</TooltipContent>*/}
          {/*</Tooltip>*/}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          {/*<Separator orientation="vertical" className="mx-1 h-6" />*/}
          {/*<Tooltip>*/}
          {/*  <Popover>*/}
          {/*    <PopoverTrigger asChild>*/}
          {/*      <TooltipTrigger asChild>*/}
          {/*        <Button variant="ghost" size="icon" disabled={!mail}>*/}
          {/*          <Clock className="h-4 w-4" />*/}
          {/*          <span className="sr-only">Snooze</span>*/}
          {/*        </Button>*/}
          {/*      </TooltipTrigger>*/}
          {/*    </PopoverTrigger>*/}
          {/*    <PopoverContent className="flex w-[535px] p-0">*/}
          {/*      <div className="flex flex-col gap-2 border-r px-2 py-4">*/}
          {/*        <div className="px-4 text-sm font-medium">Snooze until</div>*/}
          {/*        <div className="grid min-w-[250px] gap-1">*/}
          {/*          <Button*/}
          {/*            variant="ghost"*/}
          {/*            className="justify-start font-normal"*/}
          {/*          >*/}
          {/*            Later today{' '}*/}
          {/*            <span className="text-muted-foreground ml-auto">*/}
          {/*              {format(addHours(today, 4), 'E, h:m b')}*/}
          {/*            </span>*/}
          {/*          </Button>*/}
          {/*          <Button*/}
          {/*            variant="ghost"*/}
          {/*            className="justify-start font-normal"*/}
          {/*          >*/}
          {/*            Tomorrow*/}
          {/*            <span className="text-muted-foreground ml-auto">*/}
          {/*              {format(addDays(today, 1), 'E, h:m b')}*/}
          {/*            </span>*/}
          {/*          </Button>*/}
          {/*          <Button*/}
          {/*            variant="ghost"*/}
          {/*            className="justify-start font-normal"*/}
          {/*          >*/}
          {/*            This weekend*/}
          {/*            <span className="text-muted-foreground ml-auto">*/}
          {/*              {format(nextSaturday(today), 'E, h:m b')}*/}
          {/*            </span>*/}
          {/*          </Button>*/}
          {/*          <Button*/}
          {/*            variant="ghost"*/}
          {/*            className="justify-start font-normal"*/}
          {/*          >*/}
          {/*            Next week*/}
          {/*            <span className="text-muted-foreground ml-auto">*/}
          {/*              {format(addDays(today, 7), 'E, h:m b')}*/}
          {/*            </span>*/}
          {/*          </Button>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*      <div className="p-2">*/}
          {/*        <Calendar />*/}
          {/*      </div>*/}
          {/*    </PopoverContent>*/}
          {/*  </Popover>*/}
          {/*  <TooltipContent>Snooze</TooltipContent>*/}
          {/*</Tooltip>*/}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            {/*<DropdownMenuItem>Star thread</DropdownMenuItem>*/}
            {/*<DropdownMenuItem>Add label</DropdownMenuItem>*/}
            {/*<DropdownMenuItem>Mute thread</DropdownMenuItem>*/}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(' ')
                    .map((chunk) => chunk[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.date), 'PPpp')}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex-1 p-4 text-sm whitespace-pre-wrap">
            {mail.text}
          </div>
          <Separator className="mt-auto" />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                  disabled
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal text-muted-foreground"
                  >
                    <Switch id="mute" aria-label="Mute thread" disabled /> Mute
                    this thread
                  </Label>
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                    disabled
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
