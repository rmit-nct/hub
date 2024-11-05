'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@repo/ui/components/ui/button';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeleteResourceButton({ path }: { path: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [path]);

  const deleteResource = async (path: string) => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.storage.from('workspaces').remove([path]);

    if (!error) {
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={async () => {
        await deleteResource(path);
      }}
      size="icon"
      variant="destructive"
      disabled={loading}
    >
      <Trash className="h-5 w-5" />
    </Button>
  );
}
