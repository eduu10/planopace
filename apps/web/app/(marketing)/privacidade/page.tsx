import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
        <p className="text-gray-400 text-sm mb-8">Última atualização: 26 de fevereiro de 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Dados Coletados</h2>
            <p>Coletamos informações que você fornece diretamente (nome, email, dados de perfil de corredor) e dados de atividades obtidos via integrações autorizadas (Strava).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Uso dos Dados</h2>
            <p>Seus dados são utilizados para personalizar seu plano de treinamento, gerar insights de evolução, e melhorar nossos algoritmos de IA. Não vendemos seus dados pessoais a terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Integrações</h2>
            <p>Ao conectar sua conta do Strava, autorizamos o acesso apenas aos dados de atividades de corrida. Você pode revogar essa autorização a qualquer momento nas configurações do seu perfil.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Segurança</h2>
            <p>Utilizamos criptografia em trânsito (HTTPS/TLS) e em repouso para proteger seus dados. Senhas são armazenadas com hash bcrypt. Dados de pagamento são processados diretamente pelo Asaas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Cookies</h2>
            <p>Utilizamos cookies essenciais para autenticação e manutenção da sessão. Não utilizamos cookies de rastreamento publicitário.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Seus Direitos</h2>
            <p>Conforme a LGPD, você tem direito a acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato conosco.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contato</h2>
            <p>Para questões de privacidade: <a href="mailto:contato@planopace.com.br" className="text-orange-500 hover:text-orange-400">contato@planopace.com.br</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
