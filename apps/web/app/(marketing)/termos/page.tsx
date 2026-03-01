import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
        <p className="text-gray-400 text-sm mb-8">Última atualização: 26 de fevereiro de 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar o Plano Pace, você concorda com estes Termos de Uso. Se não concordar com alguma condição, por favor não utilize nossos serviços.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Descrição do Serviço</h2>
            <p>O Plano Pace é uma plataforma de treinamento de corrida que utiliza inteligência artificial para criar planilhas personalizadas. O serviço inclui integração com plataformas de atividades físicas, análise de desempenho e recomendações automatizadas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Conta do Usuário</h2>
            <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso. Todas as atividades realizadas em sua conta são de sua responsabilidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Assinatura e Pagamento</h2>
            <p>Os planos são cobrados mensalmente. Você pode cancelar a qualquer momento. O cancelamento entra em vigor ao final do período já pago. Não realizamos reembolsos proporcionais.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Uso Aceitável</h2>
            <p>Você concorda em usar o Plano Pace apenas para fins pessoais e legítimos de treinamento esportivo. É proibido compartilhar credenciais, revender o acesso ou utilizar o serviço para fins comerciais sem autorização.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Limitação de Responsabilidade</h2>
            <p>O Plano Pace fornece recomendações de treinamento geradas por inteligência artificial. Estas recomendações não substituem orientação médica ou de profissional de educação física. O usuário assume total responsabilidade pela execução dos treinos sugeridos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato: <a href="mailto:contato@planopace.com.br" className="text-orange-500 hover:text-orange-400">contato@planopace.com.br</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
