'use client';

import { addWhitelistEmail } from './actions';
import WhitelistEmailForm from './form';
import { toast } from '@ncthub/ui/sonner';
import { useTranslations } from 'next-intl';

interface Props {
  wsId: string;
  onFinish?: () => void;
}

export default function WhitelistEmailClient({ wsId, onFinish }: Props) {
  const t = useTranslations();

  const handleSubmit = async (values: { email: string }) => {
    try {
      await addWhitelistEmail(wsId, values.email, true);
      toast(t('common.success'), { description: t('common.email_added') });
      onFinish?.();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error(t('common.error'), {
        description: t('common.error_adding_email'),
      });
    }
  };

  return <WhitelistEmailForm wsId={wsId} onSubmit={handleSubmit} />;
}
