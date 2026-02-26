"use client";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold italic tracking-tighter text-white mb-4 block">
              PLANO<span className="text-orange-500">PACE</span>
            </span>
            <p className="text-gray-400 max-w-xs">
              A revolução do treinamento de corrida. Inteligência artificial aplicada à sua performance.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Produto</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Integrações</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Depoimentos</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Plano Pace. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social Icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
