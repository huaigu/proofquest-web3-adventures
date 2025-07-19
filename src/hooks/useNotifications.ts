import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/sonner';

export const useNotifications = () => {
  const { t } = useTranslation('notifications');

  const notify = {
    success: (key: string, options?: Record<string, any>) => {
      toast.success(t(`success.${key}`, options));
    },
    error: (key: string, options?: Record<string, any>) => {
      toast.error(t(`error.${key}`, options));
    },
    warning: (key: string, options?: Record<string, any>) => {
      toast.warning(t(`warning.${key}`, options));
    },
    info: (key: string, options?: Record<string, any>) => {
      toast.info(t(`info.${key}`, options));
    },
  };

  return { notify };
};