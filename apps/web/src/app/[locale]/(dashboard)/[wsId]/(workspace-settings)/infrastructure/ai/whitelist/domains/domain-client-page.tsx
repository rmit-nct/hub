'use client';

import { addWhitelistDomain } from '../emails/actions';
import WhitelistDomainForm from './domain-form';
import { toast } from '@ncthub/ui/sonner';
import { useTranslations } from 'next-intl';

interface Props {
  wsId: string;
  onFinish?: () => void;
}

export default function WhitelistDomainClient({ wsId, onFinish }: Props) {
  const t = useTranslations();

  const handleSubmit = async (values: {
    domain: string;
    description?: string;
  }) => {
    try {
      await addWhitelistDomain(
        wsId,
        values.domain,
        values.description ?? null,
        true
      );
      toast(t('common.success'), { description: t('common.domain_added') });
      onFinish?.();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error(t('common.error'), {
        description: t('common.error_adding_domain'),
      });
    }
  };

  return <WhitelistDomainForm wsId={wsId} onSubmit={handleSubmit} />;
}
