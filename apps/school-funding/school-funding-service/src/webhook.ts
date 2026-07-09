import { verifyWebhook } from '@clerk/backend/webhooks';
import { drizzleProvider } from './drizzle-provider';
import { usersTable } from './db/index';

export const handleClerkWebhook = async (
  request: Request,
  env: any,
): Promise<Response> => {
  let evt: any;
  try {
    evt = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    });
    console.log('evt: ', evt);
  } catch (err) {
    console.error('Clerk Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const { id, email_addresses, first_name, last_name } = evt.data;
  const eventType = evt.type;

  console.log(`[Clerk Webhook] Received event: ${eventType} for user: ${id}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const email = email_addresses?.[0]?.email_address || '';
    const userName =
      `${first_name || ''} ${last_name || ''}`.trim() || 'New User';

    const db = drizzleProvider(env.DB);

    try {
      await db
        .insert(usersTable)
        .values({
          id: id,
          userName,
          email,
        })
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            userName,
            email,
          },
        });

      console.log(`[D1 Sync] Successfully synced user ${id}`);
    } catch (dbError) {
      console.error('[D1 Sync Error] Failed to write to database:', dbError);
      return new Response('Database operation failed', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
};
