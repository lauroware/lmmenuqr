import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Navegación */}
      <nav className="bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl tracking-wide text-white">
                  LATIN NEXO <span className="text-primary">Menu QR</span>
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="https://latinnexo.com.ar"
                className="text-white/70 hover:text-white font-medium transition"
              >
                LatinNexo
              </a>
              <a
                href="#features"
                className="text-white/70 hover:text-white font-medium transition"
              >
                Funciones
              </a>
              <a
                href="#how-it-works"
                className="text-white/70 hover:text-white font-medium transition"
              >
                Cómo funciona
              </a>
              <a
                href="#pricing"
                className="text-white/70 hover:text-white font-medium transition"
              >
                Precios
              </a>
              <Link
                to="/login"
                className="bg-primary text-black px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sección principal (Hero) */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center">
              <h1 className="max-w-xl text-4xl md:text-5xl font-bold text-white leading-tight">
                Menús digitales hechos <span className="text-primary">simples</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/70">
                Creá menús digitales simples con opciones autogestionables para tu restaurante u hotel.
                Generá códigos QR únicos y ofrecé a tus clientes una experiencia sin esfuerzo.
              </p>

             
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="relative flex justify-center lg:justify-end">
                <div className="bg-surface border border-border rounded-3xl shadow-2xl p-6 transform rotate-2 w-full max-w-lg">
                  <div className="bg-black/40 border border-border rounded-2xl w-full h-96 flex items-center justify-center text-white/40">
                    <img src="https://i.ibb.co/C38wbzsv/Whats-App-Image-2026-01-18-at-18-12-19.jpg" alt="" />
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-2 sm:-left-6 bg-primary/10 border border-primary/20 rounded-3xl shadow-2xl p-5 transform -rotate-2 hidden sm:block">
                  <div className="bg-black/40 border border-border rounded-2xl w-64 h-64 flex items-center justify-center text-white/40">
                    <img src="https://i.ibb.co/d4cYxtLz/Whats-App-Image-2026-01-18-at-18-12-19-1.jpg" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de funciones */}
      <section id="features" className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Funciones potentes</h2>
            <p className="mt-4 text-lg text-white/70 max-w-3xl mx-auto">
              Te ofrecemos las mejores opciones para que puedas crear, administrar y compartir tu menú digital.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {[
              {
                icon: "fa-qrcode",
                title: "Códigos QR únicos",
                desc: "Generá códigos QR únicos y difíciles de adivinar. Solo quienes tengan el QR acceden.",
              },
              {
                icon: "fa-edit",
                title: "Gestión fácil del menú",
                desc: "En la opción autogestionable creá, editá y organizá ítems con categorías, descripciones, precios e imágenes.",
              },
              {
                icon: "fa-mobile-alt",
                title: "Optimizado para móvil",
                desc: "Nuestros sitios se adaptan a cualquier dispositivo para una experiencia perfecta en celulares y tablets.",
              },
              {
                icon: "fa-tags",
                title: "Etiquetas de ítems",
                desc: "Marcá vegetariano, picante, más vendido o no disponible para mejorar la experiencia.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-surface border border-border rounded-2xl p-8 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:bg-white/5"
              >
                <div>
                  <div className="mx-auto md:mx-0 w-[60px] h-[60px] flex items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/20">
                    <i className={`fas ${f.icon} text-2xl`}></i>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white text-center md:text-left">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-white/70 text-center md:text-left">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Cómo funciona */}
      <section id="how-it-works" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Cómo funciona Latin Nexo Menu QR Autogestionable</h2>
            <p className="mt-4 text-lg text-white/70 max-w-3xl mx-auto">
              Tené tu menú digital funcionando en solo unos pocos pasos simples.
            </p>
          </div>

          <div className="mt-16 space-y-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-dark border border-border rounded-2xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xl">
                    {n}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {n === 1 && "Creamos tu cuenta"}
                    {n === 2 && "Generá el código QR"}
                    {n === 3 && "Colocá los códigos QR"}
                    {n === 4 && "Los clientes escanean y ven"}
                  </h3>
                </div>
                <p className="mt-4 text-white/70 text-center md:text-left">
                  {n === 1 &&
                    "Registrate y accedé al panel. Configurá tu menú y empezá a cargar ítems."}
                  {n === 2 &&
                    "El sistema genera una URL única para tu menú. Descargá e imprimí el QR."}
                  {n === 3 &&
                    "Pegalos en mesas, en la entrada o donde quieras que el cliente los vea fácil."}
                  {n === 4 &&
                    "Con la cámara del celular, ven el menú instantáneamente, sin apps."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de precios */}
      <section id="pricing" className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Precios simples y transparentes</h2>
            <p className="mt-4 text-lg text-white/70 max-w-3xl mx-auto">
              Elegí el plan que mejor se adapte a tu negocio.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* Básico */}
            <div className="bg-surface border border-border rounded-2xl p-8 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Básico</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$ 50.000</span>
                  <span className="text-white/60"> /pago único</span>
                </div>
                <p className="mt-4 text-white/70">
                  Perfecto para restaurantes y cafeterías pequeñas.
                </p>
                <ul className="mt-8 space-y-3 text-white/70">
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Digitalización de tu menú.</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Ítems ilimitados</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Generamos el código QR u link para compartir</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Sin mantenimiento mensual</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Modificaciones en precio o items: $ 10.000</li>
                </ul>
              </div>
              <button className="mt-8 w-full bg-white/5 text-primary border border-primary/40 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
                Solicitar
              </button>
            </div>

            
            {/* Básico con diseño */}
            <div className="bg-surface border border-border rounded-2xl p-8 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Básico y Diseño</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$ 100.000</span>
                  <span className="text-white/60"> /pago único</span>
                </div>
                <p className="mt-4 text-white/70">
                  Perfecto para restaurantes y cafeterías pequeñas que no cuentan con un menú en pdf o rqquieren profesionalizarlo manteniendo una estética acorde a su marca.
                </p>
                <ul className="mt-8 space-y-3 text-white/70">
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Diseño profesional y a medida del cliente.</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Se entrega el PDF y codificamos el menú</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Generación de código QR y link para compartir</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Sin mantenimiento mensual</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-secondary"></i> Modificaciones de precio o items: $ 10.000</li>
                </ul>
              </div>
              <button className="mt-8 w-full bg-white/5 text-primary border border-primary/40 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
                Solicitar
              </button>
            </div>

            {/* Autogestionable */}
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-8 h-full flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 bg-secondary text-black px-4 py-1 rounded-bl-lg rounded-tr-2xl font-bold">
                Recomendado
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Autogestionable</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$ 25.000</span>
                  <span className="text-white/60"> /mes</span>
                </div>
                <p className="mt-4 text-white/70">
                  Ideal si hacés muchas modificaciones en el menú.
                </p>
                <ul className="mt-8 space-y-3 text-white/70">
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-primary"></i> Vos mismo generás los cambios</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-primary"></i> Ítems ilimitados</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-primary"></i> Generación de QR</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-primary"></i> Analíticas de escaneo</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check-circle text-primary"></i> Filtros y “no disponible”</li>
                </ul>
              </div>
              <button className="mt-8 w-full bg-primary text-black py-3 rounded-xl font-bold hover:opacity-90 transition">
                Empezar
              </button>
            </div>

           
          </div>
        </div>
      </section>

      {/* Sección CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/20 to-secondary/20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">¿Listo para digitalizar tu menú?</h2>
          <div className="mt-10 flex justify-center">
            <Link
              to="/signup"
              className="bg-primary text-black font-bold py-4 px-8 rounded-2xl text-lg hover:opacity-90 transition"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </section>

      {/* Pie de página */}
    <footer className="bg-surface text-white py-12 border-t border-border">
  <div className="max-w-6xl mx-auto px-4">
    
    {/* Grid principal */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
      
      {/* Brand */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <i className="fas fa-cloud text-white text-2xl"></i>
          <span className="font-bold text-xl tracking-wide">LatinNexo</span>
        </div>
        <p className="mt-4 text-white/60 max-w-xs">
          Soluciones de menú digital para restaurantes y hoteles.
        </p>
      </div>

      {/* Institucional */}
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold">Institucional</h3>
        <ul className="mt-4 space-y-2">
          <li>
            <a
              href="https://latinnexo.com.ar"
              className="text-white/60 hover:text-white transition"
            >
              LatinNexo
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-white/60 hover:text-white transition"
            >
              LatinMerch
            </a>
          </li>
        </ul>
      </div>

      {/* Contacto */}
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold">Contacto</h3>
        <ul className="mt-4 space-y-2">
          <li>
            <a
              href="mailto:ventas@latinnexo.com.ar"
              className="text-white/60 hover:text-white transition"
            >
              ventas@latinnexo.com.ar
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/5491162366175"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-white transition"
            >
              WhatsApp: 11 6236 6175
            </a>
          </li>
        </ul>
      </div>

    </div>

    {/* Línea inferior */}
    <div className="mt-12 pt-6 border-t border-border text-center text-white/40 text-sm">
      © 2026 LatinNexo. Todos los derechos reservados.
    </div>

  </div>
</footer>

    </div>
  );
};

export default Home;
