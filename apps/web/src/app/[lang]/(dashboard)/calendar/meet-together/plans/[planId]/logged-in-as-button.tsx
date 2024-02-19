import useTranslation from 'next-translate/useTranslation';
import { useTimeBlocking } from './time-blocking-provider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { User as PlatformUser } from '@/types/primitives/User';

export default function LoggedInAsButton({
  platformUser,
}: {
  platformUser: PlatformUser | null;
}) {
  const { t } = useTranslation('meet-together-plan-details');
  const { user: guestUser, setShowLogin } = useTimeBlocking();

  const user = platformUser ?? guestUser;

  return (
    <div className="bg-foreground/10 border-foreground/20 w-full rounded border p-2 text-center md:w-fit md:min-w-64">
      <div className="text-sm opacity-80">
        {user?.id ? t('interacting_as') : t('viewing_as')}
      </div>
      <div
        className={`${user?.id ? '' : 'opacity-50'} line-clamp-1 break-all font-semibold`}
      >
        {guestUser?.name ?? platformUser?.display_name ?? t('anonymous')}
      </div>
      <Separator className="bg-foreground/20 my-2" />
      <Button className="w-full" onClick={() => setShowLogin(true)}>
        {user?.id ? t('switch_account') : t('common:login')}
      </Button>
    </div>
  );
}
