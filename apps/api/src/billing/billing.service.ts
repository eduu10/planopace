import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, PlanTier } from 'database';

const prisma = new PrismaClient();

interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
}

interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  netValue: number;
  billingType: string;
  dueDate: string;
  invoiceUrl: string;
  bankSlipUrl: string | null;
  description: string | null;
  externalReference: string | null;
}

interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface AsaasSubscription {
  id: string;
  status: string;
  value: number;
  cycle: string;
  billingType: string;
  nextDueDate: string;
}

interface CreatePaymentDto {
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  planType: 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL';
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  remoteIp?: string;
}

const PLAN_PRICES: Record<string, { value: number; cycle: string; description: string }> = {
  MONTHLY: { value: 29.90, cycle: 'MONTHLY', description: 'Plano Pace - Mensal' },
  SEMIANNUAL: { value: 149.90, cycle: 'SEMIANNUALLY', description: 'Plano Pace - Semestral' },
  ANNUAL: { value: 299.90, cycle: 'YEARLY', description: 'Plano Pace - Anual' },
};

@Injectable()
export class BillingService {
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    const env = this.configService.get<string>('ASAAS_ENVIRONMENT', 'sandbox');
    this.baseUrl = env === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3';
  }

  private async getApiKey(): Promise<string> {
    const envKey = this.configService.get<string>('ASAAS_API_KEY');
    if (envKey) return envKey;

    const config = await prisma.asaasConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
    if (config?.apiKey) return config.apiKey;

    throw new BadRequestException('API key do Asaas não configurada. Configure no painel admin.');
  }

  private async asaasRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const apiKey = await this.getApiKey();
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new BadRequestException(
        `Erro Asaas: ${JSON.stringify(errorData.errors || errorData)}`
      );
    }

    return response.json() as Promise<T>;
  }

  async ensureCustomer(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.asaasCustomerId) return user.asaasCustomerId;

    const customer = await this.asaasRequest<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name || user.email.split('@')[0],
        cpfCnpj: user.cpfCnpj || undefined,
        email: user.email,
        notificationDisabled: false,
        externalReference: userId,
      }),
    });

    await prisma.user.update({
      where: { id: userId },
      data: { asaasCustomerId: customer.id },
    });

    return customer.id;
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const customerId = await this.ensureCustomer(userId);
    const plan = PLAN_PRICES[dto.planType];
    if (!plan) throw new BadRequestException('Tipo de plano inválido');

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const paymentBody: Record<string, unknown> = {
      customer: customerId,
      billingType: dto.billingType,
      value: plan.value,
      dueDate: dueDateStr,
      description: plan.description,
      externalReference: `${userId}_${dto.planType}`,
    };

    if (dto.billingType === 'CREDIT_CARD' && dto.creditCard && dto.creditCardHolderInfo) {
      paymentBody.creditCard = {
        holderName: dto.creditCard.holderName,
        number: dto.creditCard.number,
        expiryMonth: dto.creditCard.expiryMonth,
        expiryYear: dto.creditCard.expiryYear,
        ccv: dto.creditCard.ccv,
      };
      paymentBody.creditCardHolderInfo = {
        name: dto.creditCardHolderInfo.name,
        email: dto.creditCardHolderInfo.email,
        cpfCnpj: dto.creditCardHolderInfo.cpfCnpj,
        postalCode: dto.creditCardHolderInfo.postalCode,
        addressNumber: dto.creditCardHolderInfo.addressNumber,
        phone: dto.creditCardHolderInfo.phone,
      };
      if (dto.remoteIp) {
        paymentBody.remoteIp = dto.remoteIp;
      }
    }

    const payment = await this.asaasRequest<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentBody),
    });

    const dbPayment = await prisma.payment.create({
      data: {
        userId,
        asaasPaymentId: payment.id,
        billingType: dto.billingType,
        value: plan.value,
        status: payment.status,
        invoiceUrl: payment.invoiceUrl,
        bankSlipUrl: payment.bankSlipUrl,
        description: plan.description,
        externalReference: `${userId}_${dto.planType}`,
        dueDate: new Date(dueDateStr),
      },
    });

    const result: Record<string, unknown> = {
      paymentId: dbPayment.id,
      asaasPaymentId: payment.id,
      status: payment.status,
      billingType: dto.billingType,
      value: plan.value,
      invoiceUrl: payment.invoiceUrl,
    };

    if (dto.billingType === 'BOLETO') {
      result.bankSlipUrl = payment.bankSlipUrl;
    }

    if (dto.billingType === 'PIX') {
      const pixData = await this.getPixQrCode(payment.id);
      result.pixQrCode = pixData.encodedImage;
      result.pixPayload = pixData.payload;
      result.pixExpirationDate = pixData.expirationDate;

      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: {
          pixQrCode: pixData.encodedImage,
          pixPayload: pixData.payload,
        },
      });
    }

    if (dto.billingType === 'CREDIT_CARD' && payment.status === 'CONFIRMED') {
      await this.activatePlan(userId, dto.planType);
    }

    return result;
  }

  async createSubscription(userId: string, dto: CreatePaymentDto) {
    const customerId = await this.ensureCustomer(userId);
    const plan = PLAN_PRICES[dto.planType];
    if (!plan) throw new BadRequestException('Tipo de plano inválido');

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split('T')[0];

    const subBody: Record<string, unknown> = {
      customer: customerId,
      billingType: dto.billingType,
      value: plan.value,
      nextDueDate: dueDateStr,
      cycle: plan.cycle,
      description: plan.description,
      externalReference: `${userId}_${dto.planType}_sub`,
    };

    if (dto.billingType === 'CREDIT_CARD' && dto.creditCard && dto.creditCardHolderInfo) {
      subBody.creditCard = {
        holderName: dto.creditCard.holderName,
        number: dto.creditCard.number,
        expiryMonth: dto.creditCard.expiryMonth,
        expiryYear: dto.creditCard.expiryYear,
        ccv: dto.creditCard.ccv,
      };
      subBody.creditCardHolderInfo = {
        name: dto.creditCardHolderInfo.name,
        email: dto.creditCardHolderInfo.email,
        cpfCnpj: dto.creditCardHolderInfo.cpfCnpj,
        postalCode: dto.creditCardHolderInfo.postalCode,
        addressNumber: dto.creditCardHolderInfo.addressNumber,
        phone: dto.creditCardHolderInfo.phone,
      };
      if (dto.remoteIp) {
        subBody.remoteIp = dto.remoteIp;
      }
    }

    const subscription = await this.asaasRequest<AsaasSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subBody),
    });

    await prisma.user.update({
      where: { id: userId },
      data: { asaasSubId: subscription.id },
    });

    await this.activatePlan(userId, dto.planType);

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      cycle: subscription.cycle,
      value: subscription.value,
      nextDueDate: subscription.nextDueDate,
    };
  }

  private async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.asaasRequest<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');

    const asaasPayment = await this.asaasRequest<AsaasPayment>(
      `/payments/${payment.asaasPaymentId}`
    );

    if (asaasPayment.status !== payment.status) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: asaasPayment.status,
          paidAt: ['RECEIVED', 'CONFIRMED'].includes(asaasPayment.status) ? new Date() : null,
        },
      });
    }

    return {
      paymentId: payment.id,
      status: asaasPayment.status,
      billingType: payment.billingType,
      value: payment.value,
    };
  }

  async handleWebhook(body: Record<string, unknown>) {
    const event = body.event as string;
    const payment = body.payment as Record<string, unknown> | undefined;

    if (!payment?.id) return { received: true };

    const asaasPaymentId = payment.id as string;
    const status = payment.status as string;

    const dbPayment = await prisma.payment.findUnique({
      where: { asaasPaymentId },
    });

    if (dbPayment) {
      await prisma.payment.update({
        where: { asaasPaymentId },
        data: {
          status,
          paidAt: ['RECEIVED', 'CONFIRMED'].includes(status) ? new Date() : dbPayment.paidAt,
        },
      });

      if (['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)) {
        const ref = dbPayment.externalReference;
        if (ref) {
          const parts = ref.split('_');
          const userId = parts[0];
          const planType = parts[1] as string;
          if (userId && planType) {
            await this.activatePlan(userId, planType);
          }
        }
      }

      if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED' || event === 'PAYMENT_REFUNDED') {
        const ref = dbPayment.externalReference;
        if (ref) {
          const userId = ref.split('_')[0];
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: { plan: 'STARTER', asaasSubId: null },
            });
          }
        }
      }
    }

    return { received: true };
  }

  private async activatePlan(userId: string, planType: string) {
    let tier: PlanTier = 'PRO';
    if (planType === 'ANNUAL') tier = 'ELITE';

    await prisma.user.update({
      where: { id: userId },
      data: { plan: tier },
    });
  }

  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const lastPayment = await prisma.payment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      plan: user.plan,
      asaasSubId: user.asaasSubId,
      hasActiveSubscription: !!user.asaasSubId,
      lastPayment: lastPayment ? {
        id: lastPayment.id,
        status: lastPayment.status,
        billingType: lastPayment.billingType,
        value: lastPayment.value,
        paidAt: lastPayment.paidAt,
      } : null,
    };
  }

  async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.asaasSubId) throw new NotFoundException('Nenhuma assinatura ativa');

    await this.asaasRequest(`/subscriptions/${user.asaasSubId}`, { method: 'DELETE' });

    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'STARTER', asaasSubId: null },
    });

    return { cancelled: true };
  }

  async getConfig() {
    const config = await prisma.asaasConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
    const envKey = this.configService.get<string>('ASAAS_API_KEY');
    const envEnv = this.configService.get<string>('ASAAS_ENVIRONMENT', 'sandbox');

    return {
      configured: !!(config?.apiKey || envKey),
      environment: config?.environment || envEnv,
      source: config?.apiKey ? 'database' : envKey ? 'env' : 'none',
    };
  }

  async saveConfig(apiKey: string, environment: string) {
    const existing = await prisma.asaasConfig.findFirst({ orderBy: { updatedAt: 'desc' } });

    if (existing) {
      await prisma.asaasConfig.update({
        where: { id: existing.id },
        data: { apiKey, environment },
      });
    } else {
      await prisma.asaasConfig.create({
        data: { apiKey, environment },
      });
    }

    this.baseUrl = environment === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3';

    return { saved: true };
  }

  async testConnection() {
    try {
      const result = await this.asaasRequest<{ object: string }>('/finance/getCurrentBalance');
      return { connected: true, balance: result };
    } catch (error) {
      return { connected: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  async listPayments(userId?: string) {
    const where = userId ? { userId } : {};
    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true } } },
    });
    return payments;
  }
}
