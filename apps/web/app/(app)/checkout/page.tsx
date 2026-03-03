"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  FileText,
  Check,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

type BillingType = "PIX" | "CREDIT_CARD" | "BOLETO";
type PlanType = "MONTHLY" | "SEMIANNUAL" | "ANNUAL";
type Step = "plan" | "payment" | "processing" | "success" | "error";

const PLANS: Record<PlanType, { name: string; price: string; priceNum: number; period: string; subtitle: string }> = {
  MONTHLY: { name: "Mensal", price: "29,90", priceNum: 29.9, period: "/mês", subtitle: "Cobrança mensal" },
  SEMIANNUAL: { name: "Semestral", price: "149,90", priceNum: 149.9, period: "/6 meses", subtitle: "Ganhe 1 mês grátis" },
  ANNUAL: { name: "Anual", price: "299,90", priceNum: 299.9, period: "/ano", subtitle: "Ganhe 2 meses grátis + camisa" },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialPlan = (searchParams.get("plan") as PlanType) || "SEMIANNUAL";

  const [step, setStep] = useState<Step>("plan");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan);
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Credit card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [holderCpf, setHolderCpf] = useState("");
  const [holderPhone, setHolderPhone] = useState("");
  const [holderPostalCode, setHolderPostalCode] = useState("");
  const [holderAddressNumber, setHolderAddressNumber] = useState("");

  // Payment result state
  const [pixQrCode, setPixQrCode] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [bankSlipUrl, setBankSlipUrl] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  const getToken = () => {
    const stored = localStorage.getItem("planopace_user");
    if (stored) return JSON.parse(stored).token || "";
    return "";
  };

  const formatCardNumber = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 16);
    return nums.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 4);
    if (nums.length > 2) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return nums;
  };

  const formatCpf = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length > 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
    if (nums.length > 6) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    if (nums.length > 3) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    return nums;
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length > 6) return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    if (nums.length > 2) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return nums;
  };

  const formatCep = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 8);
    if (nums.length > 5) return `${nums.slice(0, 5)}-${nums.slice(5)}`;
    return nums;
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        billingType,
        planType: selectedPlan,
      };

      if (billingType === "CREDIT_CARD") {
        const rawNumber = cardNumber.replace(/\s/g, "");
        const [expiryMonth, expiryYear] = cardExpiry.split("/");
        const rawCpf = holderCpf.replace(/\D/g, "");
        const rawPhone = holderPhone.replace(/\D/g, "");
        const rawCep = holderPostalCode.replace(/\D/g, "");

        if (!rawNumber || !cardName || !expiryMonth || !expiryYear || !cardCvv) {
          setError("Preencha todos os dados do cartão.");
          setLoading(false);
          return;
        }
        if (!rawCpf || !rawPhone || !rawCep || !holderAddressNumber) {
          setError("Preencha todos os dados do titular.");
          setLoading(false);
          return;
        }

        body.creditCard = {
          holderName: cardName,
          number: rawNumber,
          expiryMonth,
          expiryYear: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
          ccv: cardCvv,
        };
        body.creditCardHolderInfo = {
          name: cardName,
          email: user?.email || "",
          cpfCnpj: rawCpf,
          postalCode: rawCep,
          addressNumber: holderAddressNumber,
          phone: rawPhone,
        };
      }

      setStep("processing");

      const res = await fetch(`${apiUrl}/billing/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao processar pagamento");
      }

      const data = await res.json();
      setPaymentId(data.paymentId);
      setInvoiceUrl(data.invoiceUrl || "");

      if (billingType === "PIX") {
        setPixQrCode(data.pixQrCode || "");
        setPixPayload(data.pixPayload || "");
      }

      if (billingType === "BOLETO") {
        setBankSlipUrl(data.bankSlipUrl || "");
      }

      if (billingType === "CREDIT_CARD" && data.status === "CONFIRMED") {
        setStep("success");
      } else {
        setStep("success");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const plan = PLANS[selectedPlan];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/perfil" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Checkout</h1>
          <p className="text-xs text-gray-500">Pagamento seguro via Asaas</p>
        </div>
        <Shield className="w-5 h-5 text-green-500 ml-auto" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Plan */}
        {step === "plan" && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Escolha seu plano</h2>

            {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedPlan === key
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-[#141415] border-white/[0.06] hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-400">R$</span>
                      <span className="text-2xl font-black">{p.price}</span>
                    </div>
                    <span className="text-xs text-gray-500">{p.period}</span>
                  </div>
                </div>
                {selectedPlan === key && (
                  <div className="mt-2 flex items-center gap-1.5 text-orange-400 text-xs">
                    <Check className="w-3.5 h-3.5" />
                    Selecionado
                  </div>
                )}
              </button>
            ))}

            <button
              onClick={() => setStep("payment")}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25"
            >
              Continuar para Pagamento
            </button>
          </motion.div>
        )}

        {/* Step 2: Payment Method */}
        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Plan summary */}
            <div className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Plano {plan.name}</p>
                  <p className="text-xs text-gray-600">{plan.subtitle}</p>
                </div>
                <p className="text-xl font-black">R$ {plan.price}</p>
              </div>
            </div>

            {/* Billing type selector */}
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Forma de pagamento</h2>
            <div className="grid grid-cols-3 gap-2">
              {([
                { type: "PIX" as BillingType, label: "PIX", icon: QrCode, color: "text-green-400" },
                { type: "CREDIT_CARD" as BillingType, label: "Cartão", icon: CreditCard, color: "text-blue-400" },
                { type: "BOLETO" as BillingType, label: "Boleto", icon: FileText, color: "text-yellow-400" },
              ]).map((method) => (
                <button
                  key={method.type}
                  onClick={() => setBillingType(method.type)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    billingType === method.type
                      ? "bg-orange-500/10 border-orange-500/30"
                      : "bg-[#141415] border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  <method.icon className={`w-5 h-5 mx-auto mb-1 ${billingType === method.type ? "text-orange-500" : method.color}`} />
                  <span className="text-xs font-medium">{method.label}</span>
                </button>
              ))}
            </div>

            {/* Credit Card Form */}
            {billingType === "CREDIT_CARD" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <div className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06] space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    Dados do Cartão
                  </h3>
                  <input
                    type="text"
                    placeholder="Número do cartão"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    maxLength={19}
                  />
                  <input
                    type="text"
                    placeholder="Nome no cartão"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                      maxLength={5}
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06] space-y-3">
                  <h3 className="text-sm font-bold">Dados do Titular</h3>
                  <input
                    type="text"
                    placeholder="CPF"
                    value={holderCpf}
                    onChange={(e) => setHolderCpf(formatCpf(e.target.value))}
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    maxLength={14}
                  />
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={holderPhone}
                    onChange={(e) => setHolderPhone(formatPhone(e.target.value))}
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    maxLength={15}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="CEP"
                      value={holderPostalCode}
                      onChange={(e) => setHolderPostalCode(formatCep(e.target.value))}
                      className="bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                      maxLength={9}
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={holderAddressNumber}
                      onChange={(e) => setHolderAddressNumber(e.target.value)}
                      className="bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Pagar R$ {plan.price}
                  </>
                )}
              </button>
              <button
                onClick={() => setStep("plan")}
                className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-4"
          >
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
            <p className="text-gray-400">Processando pagamento...</p>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* PIX Result */}
            {billingType === "PIX" && pixQrCode && (
              <div className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06] text-center space-y-4">
                <div className="bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">PIX Gerado!</h2>
                  <p className="text-sm text-gray-400 mt-1">Escaneie o QR Code ou copie o código</p>
                </div>

                <div className="bg-white rounded-2xl p-4 mx-auto w-fit">
                  <Image
                    src={`data:image/png;base64,${pixQrCode}`}
                    alt="QR Code PIX"
                    width={200}
                    height={200}
                    className="w-48 h-48"
                  />
                </div>

                <button
                  onClick={copyPixCode}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-500/10 text-green-400 font-medium rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar código PIX
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-600">
                  O pagamento será confirmado automaticamente em alguns segundos.
                </p>
              </div>
            )}

            {/* Boleto Result */}
            {billingType === "BOLETO" && (
              <div className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06] text-center space-y-4">
                <div className="bg-yellow-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Boleto Gerado!</h2>
                  <p className="text-sm text-gray-400 mt-1">Acesse o link abaixo para visualizar</p>
                </div>

                {bankSlipUrl && (
                  <a
                    href={bankSlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-yellow-500/10 text-yellow-400 font-medium rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 transition-all text-center"
                  >
                    Abrir Boleto
                  </a>
                )}

                {invoiceUrl && (
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-gray-500 hover:text-white transition-colors underline"
                  >
                    Ver fatura completa
                  </a>
                )}
              </div>
            )}

            {/* Credit Card Success */}
            {billingType === "CREDIT_CARD" && (
              <div className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06] text-center space-y-4">
                <div className="bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Pagamento Aprovado!</h2>
                  <p className="text-sm text-gray-400 mt-1">Seu plano {plan.name} já está ativo.</p>
                </div>
              </div>
            )}

            {/* Plan summary */}
            <div className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Plano</span>
                <span className="font-bold">{plan.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Valor</span>
                <span className="font-bold">R$ {plan.price}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Pagamento</span>
                <span className="font-bold">
                  {billingType === "PIX" ? "PIX" : billingType === "CREDIT_CARD" ? "Cartão de Crédito" : "Boleto"}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
            >
              Ir para o Dashboard
            </button>
          </motion.div>
        )}

        {/* Error State */}
        {step === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-4"
          >
            <div className="bg-red-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold">Erro no Pagamento</h2>
            <p className="text-sm text-gray-400">{error || "Ocorreu um erro inesperado."}</p>
            <button
              onClick={() => setStep("payment")}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            >
              Tentar novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
