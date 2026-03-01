"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Target, Calendar, Check, ShoppingBag, Shirt } from "lucide-react";

const plans = [
  {
    id: "mensal",
    name: "Mensal",
    price: "29,90",
    period: "/mês",
    subtitle: "Cobrança mensal",
    shirtIncluded: false,
  },
  {
    id: "semestral",
    name: "Semestral",
    price: "149,90",
    period: "/6 meses",
    subtitle: "Ganhe 1 mês grátis",
    highlight: true,
    shirtIncluded: false,
  },
  {
    id: "anual",
    name: "Anual",
    price: "299,90",
    period: "/ano",
    subtitle: "Ganhe 2 meses grátis + camisa",
    shirtIncluded: true,
  },
];

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("semestral");
  const [addShirt, setAddShirt] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    goal: "",
    experience: "",
    daysPerWeek: "4",
  });

  const currentPlan = plans.find((p) => p.id === selectedPlan);
  const showUpsell = selectedPlan === "mensal" || selectedPlan === "semestral";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  };

  const getTotal = () => {
    const base = parseFloat((currentPlan?.price ?? "0").replace(",", "."));
    const shirt = showUpsell && addShirt ? 69.9 : 0;
    return (base + shirt).toFixed(2).replace(".", ",");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-bold italic tracking-tighter text-white">
            PLANO<span className="text-orange-500">PACE</span>
          </span>
        </Link>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-orange-500" : "bg-white/10"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-orange-500" : "bg-white/10"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 3 ? "bg-orange-500" : "bg-white/10"}`} />
        </div>

        {/* Card */}
        <div className="bg-[#141415] rounded-2xl p-8 border border-white/[0.06]">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
              <p className="text-gray-400 text-sm mb-6">Comece a treinar de forma inteligente.</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Seu perfil de corredor</h1>
              <p className="text-gray-400 text-sm mb-6">Vamos personalizar seu treino.</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Escolha seu plano</h1>
              <p className="text-gray-400 text-sm mb-6">Todas as funcionalidades incluídas.</p>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Qual seu objetivo?</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      name="goal"
                      value={form.goal}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none"
                    >
                      <option value="" className="bg-[#141415]">Selecione...</option>
                      <option value="5k" className="bg-[#141415]">Completar 5K</option>
                      <option value="10k" className="bg-[#141415]">Completar 10K</option>
                      <option value="21k" className="bg-[#141415]">Meia Maratona</option>
                      <option value="42k" className="bg-[#141415]">Maratona</option>
                      <option value="pace" className="bg-[#141415]">Melhorar meu pace</option>
                      <option value="health" className="bg-[#141415]">Correr para saúde</option>
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Nível de experiência</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "beginner", label: "Iniciante" },
                      { value: "intermediate", label: "Intermediário" },
                      { value: "advanced", label: "Avançado" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, experience: opt.value })}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          form.experience === opt.value
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days per week */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Dias por semana</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      name="daysPerWeek"
                      value={form.daysPerWeek}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none"
                    >
                      <option value="3" className="bg-[#141415]">3 dias</option>
                      <option value="4" className="bg-[#141415]">4 dias</option>
                      <option value="5" className="bg-[#141415]">5 dias</option>
                      <option value="6" className="bg-[#141415]">6 dias</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {/* Plan Selection */}
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        if (plan.shirtIncluded) setAddShirt(false);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        selectedPlan === plan.id
                          ? "bg-orange-500/10 border-orange-500"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPlan === plan.id ? "border-orange-500 bg-orange-500" : "border-gray-500"
                        }`}>
                          {selectedPlan === plan.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{plan.name}</span>
                            {plan.highlight && (
                              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Popular</span>
                            )}
                          </div>
                          <span className="text-gray-400 text-xs">{plan.subtitle}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">R$ {plan.price}</span>
                        <span className="text-gray-400 text-xs block">{plan.period}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Upsell Shirt */}
                <AnimatePresence>
                  {showUpsell && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setAddShirt(!addShirt)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left mt-2 ${
                          addShirt
                            ? "bg-orange-500/10 border-orange-500"
                            : "bg-white/5 border-white/10 hover:border-orange-500/50"
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src="/camisamasculina.png"
                            alt="Camisa Plano Pace"
                            className="w-20 h-20 object-contain rounded-lg"
                          />
                          {addShirt && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Shirt className="w-4 h-4 text-orange-500" />
                            <span className="text-white font-bold text-sm">Adicionar camisa de corrida</span>
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">
                            Camisa dry-fit exclusiva Plano Pace. Envio grátis.
                          </p>
                        </div>
                        <span className="text-orange-500 font-bold text-sm flex-shrink-0">+R$ 69,90</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Order Summary */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Plano {currentPlan?.name}</span>
                    <span className="text-white">R$ {currentPlan?.price}</span>
                  </div>
                  {showUpsell && addShirt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Camisa de corrida</span>
                      <span className="text-white">R$ 69,90</span>
                    </div>
                  )}
                  {selectedPlan === "anual" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Camisa de corrida</span>
                      <span className="text-green-400 font-medium">Grátis</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-orange-500 font-bold text-lg">R$ {getTotal()}</span>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === 1 ? (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : step === 2 ? (
                <>
                  Escolher plano
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Finalizar — R$ {getTotal()}
                </>
              )}
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setStep(step - 1);
                  if (step === 3) setAddShirt(false);
                }}
                className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
              >
                Voltar
              </button>
            )}
          </form>

          {step === 1 && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-[#141415] text-gray-500">ou registre com</span>
                </div>
              </div>

              {/* Google OAuth */}
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
            Faça login
          </Link>
        </p>

        <p className="text-center text-gray-600 text-xs mt-4">
          Ao criar sua conta, você concorda com nossos{" "}
          <Link href="/termos" className="text-gray-500 hover:text-gray-400 underline">Termos de Uso</Link>{" "}
          e{" "}
          <Link href="/privacidade" className="text-gray-500 hover:text-gray-400 underline">Política de Privacidade</Link>.
        </p>
      </motion.div>
    </div>
  );
}
