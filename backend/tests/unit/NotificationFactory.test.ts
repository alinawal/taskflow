import { NotificationFactory } from '../../src/factories/NotificationFactory';
import { InAppNotificationChannel } from '../../src/factories/channels/InAppNotificationChannel';
import { EmailNotificationChannel } from '../../src/factories/channels/EmailNotificationChannel';

describe('NotificationFactory (unit)', () => {
  it('returns the in-app channel for IN_APP', () => {
    const channel = NotificationFactory.getChannel('IN_APP');
    expect(channel).toBeInstanceOf(InAppNotificationChannel);
    expect(channel.channelName).toBe('IN_APP');
  });

  it('returns the email channel for EMAIL', () => {
    const channel = NotificationFactory.getChannel('EMAIL');
    expect(channel).toBeInstanceOf(EmailNotificationChannel);
    expect(channel.channelName).toBe('EMAIL');
  });

  it('throws for an unsupported channel type', () => {
    expect(() => NotificationFactory.getChannel('SMS' as any)).toThrow(
      'Unsupported notification channel: SMS',
    );
  });

  it('getDefaultChannels returns every registered channel', () => {
    const channels = NotificationFactory.getDefaultChannels();
    expect(channels).toHaveLength(2);
    expect(channels.map((c) => c.channelName).sort()).toEqual(['EMAIL', 'IN_APP']);
  });
});
