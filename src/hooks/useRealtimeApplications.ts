import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { createElement } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface LoanApplication {
  id: string;
  business_name: string;
  owner_name: string;
  loan_amount: number;
  status: string;
}

export const useRealtimeApplications = (onUpdate?: () => void) => {
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const showPushNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'new-application',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();

    const channel = supabase
      .channel('loan-applications-realtime')
      .on<LoanApplication>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_applications',
        },
        (payload: RealtimePostgresChangesPayload<LoanApplication>) => {
          console.log('Realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            const app = payload.new;
            
            // Show toast notification
            toast.success(`New Application: ${app.business_name}`, {
              description: `${app.owner_name} applied for KSh ${app.loan_amount?.toLocaleString()}`,
              icon: createElement(FileText, { className: 'w-4 h-4' }),
              action: {
                label: 'View',
                onClick: () => window.location.href = '/admin/applications',
              },
            });

            // Show push notification
            showPushNotification(
              'New Loan Application',
              `${app.business_name} - ${app.owner_name} applied for KSh ${app.loan_amount?.toLocaleString()}`
            );
          } else if (payload.eventType === 'UPDATE') {
            const oldRecord = payload.old as LoanApplication | undefined;
            const newRecord = payload.new;
            
            if (oldRecord?.status !== newRecord?.status) {
              toast.info(`Application Updated`, {
                description: `${newRecord.business_name} status changed to ${newRecord.status}`,
              });
            }
          }

          // Trigger callback to refresh data
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate, requestNotificationPermission, showPushNotification]);
};

export default useRealtimeApplications;
