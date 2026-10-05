export interface EmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  html: string;
  text?: string;
  eventType: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }>;
}

class ConsoleMockEmailProvider implements EmailProvider {
  name = 'ConsoleMockEmailProvider';

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId: string }> {
    const messageId = `email-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    console.log(`[WorkNova Email Dispatcher] Event: [${payload.eventType}] To: ${payload.to} (${payload.recipientName}) | Subject: "${payload.subject}"`);
    return { success: true, messageId };
  }
}

export class EmailNotificationService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    this.provider = provider || new ConsoleMockEmailProvider();
  }

  public setProvider(provider: EmailProvider): void {
    this.provider = provider;
  }

  public async sendNewMessageNotification(to: string, name: string, senderName: string, projectTitle: string, snippet: string) {
    return this.provider.sendEmail({
      to,
      recipientName: name,
      subject: `New message from ${senderName} regarding ${projectTitle}`,
      html: `<p>Hi ${name},</p><p><strong>${senderName}</strong> sent you a message:</p><blockquote>"${snippet}"</blockquote><p><a href="/messages">View Conversation in WorkNova</a></p>`,
      eventType: 'NEW_MESSAGE',
    });
  }

  public async sendContractAcceptedNotification(to: string, name: string, contractorName: string, projectTitle: string) {
    return this.provider.sendEmail({
      to,
      recipientName: name,
      subject: `Contract accepted for ${projectTitle}!`,
      html: `<p>Hi ${name},</p><p><strong>${contractorName}</strong> has accepted the contract terms for "${projectTitle}". You can now proceed to fund Milestone 1 into escrow.</p>`,
      eventType: 'CONTRACT_ACCEPTED',
    });
  }

  public async sendDeliverySubmittedNotification(to: string, name: string, freelancerName: string, milestoneTitle: string) {
    return this.provider.sendEmail({
      to,
      recipientName: name,
      subject: `Milestone delivery submitted: ${milestoneTitle}`,
      html: `<p>Hi ${name},</p><p><strong>${freelancerName}</strong> has delivered work for milestone "${milestoneTitle}". Please review the files and code deliverables within 14 days.</p>`,
      eventType: 'DELIVERY_SUBMITTED',
    });
  }

  public async sendPaymentSuccessNotification(to: string, name: string, amount: number, currency: string, milestoneTitle: string) {
    return this.provider.sendEmail({
      to,
      recipientName: name,
      subject: `Payment confirmed for ${milestoneTitle}`,
      html: `<p>Hi ${name},</p><p>Your payment of ${currency} ${amount.toLocaleString()} has been safely placed into WorkNova escrow for "${milestoneTitle}".</p>`,
      eventType: 'PAYMENT_SUCCESS',
    });
  }

  public async sendPayoutCompletedNotification(to: string, name: string, amount: number, currency: string) {
    return this.provider.sendEmail({
      to,
      recipientName: name,
      subject: `Withdrawal processed: ${currency} ${amount.toLocaleString()}`,
      html: `<p>Hi ${name},</p><p>Your payout of ${currency} ${amount.toLocaleString()} has been sent to your bank account / payout destination.</p>`,
      eventType: 'PAYOUT_COMPLETED',
    });
  }

  public async sendDisputeUpdateNotification(to: string, name: string, disputeId: string, status: string) {
    return this.provider.sendEmail({
      to,
      recipientName: name,
      subject: `Dispute ${disputeId} status update: ${status}`,
      html: `<p>Hi ${name},</p><p>There is an administrative update on dispute case ${disputeId}. Status: ${status}.</p>`,
      eventType: 'DISPUTE_UPDATED',
    });
  }
}

export const emailService = new EmailNotificationService();
