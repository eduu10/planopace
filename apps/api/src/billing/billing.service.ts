import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaClient, PlanTier } from 'database';

const prisma = new PrismaClient();

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY', ''), {
      apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    });
  }

  async createCheckout(userId: string, priceId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({ email: user.email, name: user.name || undefined });
      customerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${this.configService.get('NEXT_PUBLIC_APP_URL')}/dashboard?checkout=success`,
      cancel_url: `${this.configService.get('NEXT_PUBLIC_APP_URL')}/dashboard?checkout=cancel`,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        let tier: PlanTier = 'STARTER';
        if (priceId === this.configService.get('STRIPE_PRO_PRICE_ID')) tier = 'PRO';
        if (priceId === this.configService.get('STRIPE_ELITE_PRICE_ID')) tier = 'ELITE';

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: tier, stripeSubId: subscription.id },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'STARTER', stripeSubId: null },
        });
        break;
      }
    }

    return { received: true };
  }

  async createPortalSession(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) throw new NotFoundException('Nenhuma assinatura ativa');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${this.configService.get('NEXT_PUBLIC_APP_URL')}/perfil`,
    });

    return { url: session.url };
  }

  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return {
      plan: user.plan,
      stripeSubId: user.stripeSubId,
      hasActiveSubscription: !!user.stripeSubId,
    };
  }
}
