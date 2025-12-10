import { supabase } from '@/integrations/supabase/client';

type NotificationType = 'approved' | 'rejected' | 'pending' | 'disbursed' | 'custom';

interface SendSmsParams {
  phone: string;
  message: string;
  applicationId?: string;
  notificationType: NotificationType;
}

interface SmsResponse {
  success: boolean;
  provider: string;
  messageId?: string;
  message: string;
}

export const getStatusMessage = (
  status: 'approved' | 'rejected' | 'disbursed',
  businessName: string,
  loanAmount?: number,
  rejectionReason?: string
): string => {
  const formattedAmount = loanAmount?.toLocaleString() || '';

  switch (status) {
    case 'approved':
      return `Congratulations! Your loan application for ${businessName} has been APPROVED for KSh ${formattedAmount}. Funds will be disbursed shortly. Thank you for choosing Zion Link Technologies.`;
    
    case 'rejected':
      return `Dear Customer, your loan application for ${businessName} has been declined. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please contact us for more details.'} You may reapply after addressing the concerns. - Zion Link Technologies`;
    
    case 'disbursed':
      return `Great news! KSh ${formattedAmount} has been disbursed to your distributor for ${businessName}. Please check with your distributor to confirm receipt. Thank you! - Zion Link Technologies`;
    
    default:
      return '';
  }
};

export const sendSms = async (params: SendSmsParams): Promise<SmsResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: params,
    });

    if (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        provider: 'unknown',
        message: error.message || 'Failed to send SMS',
      };
    }

    return data as SmsResponse;
  } catch (error) {
    console.error('SMS send exception:', error);
    return {
      success: false,
      provider: 'unknown',
      message: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
};

export const sendStatusNotification = async (
  phone: string,
  status: 'approved' | 'rejected' | 'disbursed',
  businessName: string,
  applicationId: string,
  loanAmount?: number,
  rejectionReason?: string
): Promise<SmsResponse> => {
  const message = getStatusMessage(status, businessName, loanAmount, rejectionReason);
  
  return sendSms({
    phone,
    message,
    applicationId,
    notificationType: status,
  });
};