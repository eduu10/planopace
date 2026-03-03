import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import type { Request } from 'express';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('payment')
  @ApiOperation({ summary: 'Criar pagamento via Asaas (PIX, Cartão, Boleto)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Req() req: Request,
    @Body() body: {
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
    },
  ) {
    const user = req.user as { userId: string };
    const remoteIp = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    return this.billingService.createPayment(user.userId, { ...body, remoteIp });
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Criar assinatura recorrente via Asaas' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Req() req: Request,
    @Body() body: {
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
    },
  ) {
    const user = req.user as { userId: string };
    const remoteIp = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    return this.billingService.createSubscription(user.userId, { ...body, remoteIp });
  }

  @Get('payment/:id/status')
  @ApiOperation({ summary: 'Verificar status do pagamento' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async paymentStatus(@Param('id') id: string) {
    return this.billingService.getPaymentStatus(id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook Asaas' })
  async webhook(@Body() body: Record<string, unknown>) {
    return this.billingService.handleWebhook(body);
  }

  @Get('status')
  @ApiOperation({ summary: 'Status da assinatura do usuário' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.billingService.getStatus(user.userId);
  }

  @Delete('subscription')
  @ApiOperation({ summary: 'Cancelar assinatura' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.billingService.cancelSubscription(user.userId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Listar pagamentos (admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async listPayments() {
    return this.billingService.listPayments();
  }

  @Get('config')
  @ApiOperation({ summary: 'Verificar configuração Asaas (admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getConfig() {
    return this.billingService.getConfig();
  }

  @Post('config')
  @ApiOperation({ summary: 'Salvar configuração Asaas (admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async saveConfig(@Body() body: { apiKey: string; environment: string }) {
    return this.billingService.saveConfig(body.apiKey, body.environment);
  }

  @Get('config/test')
  @ApiOperation({ summary: 'Testar conexão Asaas (admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async testConnection() {
    return this.billingService.testConnection();
  }
}
