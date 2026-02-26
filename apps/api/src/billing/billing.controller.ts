import { Controller, Get, Post, Body, UseGuards, Req, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import type { Request } from 'express';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Criar Stripe Checkout Session' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async checkout(@Req() req: Request, @Body() body: { priceId: string }) {
    const user = req.user as { userId: string };
    return this.billingService.createCheckout(user.userId, body.priceId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook' })
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.rawBody;
    if (!rawBody) return { received: false };
    return this.billingService.handleWebhook(rawBody, signature);
  }

  @Get('portal')
  @ApiOperation({ summary: 'Link para Stripe Customer Portal' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async portal(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.billingService.createPortalSession(user.userId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Status da assinatura' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.billingService.getStatus(user.userId);
  }
}
