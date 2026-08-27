import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

export default function Home() {
   return (
      <>
         <div className="relative" style={{
            // backgroundImage: 'linear-gradient(rgba(249, 168, 212, 0.7), rgba(249, 168, 212, 0.4)), url(/images/flores2.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 'calc(100vh - 80px)', // Restamos la altura aproximada del navbar
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#9c2868',
            padding: '40px 10px 80px 10px' // Padding inferior para dejar espacio a la ola
         }}>
            <div className="home-container">
               <img src="/images/logo.png" alt="Logo" className="mx-auto block w-40 h-auto brightness-0 invert pb-8" />

               <div className="relative inline-block">
                  {/* Bola Disco Superior Izquierda */}
                  <img 
                     src="/images/bola disco.png" 
                     alt="Bola disco" 
                     className="absolute -top-4 -left-8 sm:-left-12 md:-left-16 w-12 sm:w-16 md:w-20 h-auto object-contain pointer-events-none drop-shadow-md" 
                  />

                  <p className="font-bodoni text-[48px] sm:text-[60px] md:text-[72px] text-white leading-none mb-5">
                     Ten la <span className="font-pinyon">libertad</span> de<br />
                     usar lo que te haga <br />
                     sentir <span className="font-pinyon">única</span>
                  </p>

                  {/* Bola Disco Inferior Derecha */}
                  <img 
                     src="/images/bola disco.png" 
                     alt="Bola disco" 
                     className="absolute bottom-2 -right-6 sm:-right-10 md:-right-14 w-10 sm:w-14 md:w-16 h-auto object-contain pointer-events-none drop-shadow-md scale-x-[-1]" 
                  />
               </div>

               <br />
               <span className="bg-[#e83d9c] rounded-full font-poppins text-2xl font-bold italic text-white p-5 py-2 mb-5 inline-block">Vestidos Curvy / Tallas Extra</span><br />
               <span className="text-white inline-block mt-5">@lamaschispa</span>
            </div>

            {/* Borde ondulado en la parte inferior */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
               <svg className="relative block w-full h-10 sm:h-14 md:h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path fill="currentColor" d="M0,60 Q30,110 60,60 T120,60 T180,60 T240,60 T300,60 T360,60 T420,60 T480,60 T540,60 T600,60 T660,60 T720,60 T780,60 T840,60 T900,60 T960,60 T1020,60 T1080,60 T1140,60 T1200,60 V120 H0 Z"></path>
               </svg>
            </div>
         </div>

         <div className="px-6 md:px-20 mt-10">
            {/* Título + Raya */}
            <div className="flex items-center gap-4">
               <span className="text-[#ffb727] text-[36px] md:text-[50px] font-bodoni">
                  Conoce a los <span className="font-pinyon">Recien llegados</span>
               </span>
               <div className="w-20 h-[1px] bg-[#ffb727]"></div>
            </div>

            {/* Galería de fotos horizontal en una nueva línea */}
            <div className="flex items-center justify-between mt-6 overflow-x-auto">
               <img src="/images/shineGold.jpg" alt="Vestido" className="w-45 h-auto object-cover rounded-2xl shadow-sm flex-shrink-0" />
               <img src="/images/rosaTopacio.jpg" alt="Vestido" className="w-45 h-auto object-cover rounded-2xl shadow-sm flex-shrink-0" />
               <img src="/images/redDress.jpg" alt="Vestido" className="w-45 h-auto object-cover rounded-2xl shadow-sm flex-shrink-0" />
               <img src="/images/pinkDress.jpg" alt="Vestido" className="w-45 h-auto object-cover rounded-2xl shadow-sm flex-shrink-0" />
               <img src="/images/goldPink.jpg" alt="Vestido" className="w-45 h-auto object-cover rounded-2xl shadow-sm flex-shrink-0" />
               <img src="/images/goldPink.jpg" alt="Vestido" className="w-45 h-auto object-cover rounded-2xl shadow-sm flex-shrink-0" />
            </div>
         </div>

         <div className=" px-6 md:px-20 mt-15 text-center">
            <span className="font-bodoni text-[36px] md:text-[50px]">¿Cómo Rentar?</span>
            <div className="bg-[#fff8f5] p-10 font-poppins mt-5">
               <div className="flex text-center justify-center gap-40 ">
                  <div className="flex flex-col items-center gap-3"><img src="/images/Artboard 1.png" alt="" />Encuentra el vestido<br /> perfecto aquí en nuestro catalogo<br /> o fisicamente en nuestra tienda</div>
                  <div className="flex flex-col items-center gap-3"><img src="/images/Artboard 2.png" alt="" />Acude a nuestra tienda<br /> para medirtelo y separarlo</div>
               </div>
               <div className="flex text-center justify-center gap-5 mt-10 text-xl items-baseline">
                  <div className="font-bodoni text-3xl">Tu Renta incluye:</div>
                  <div className="font-bold">Tintorería</div>
                  <div className="font-bold">Ajustes</div>
                  <div>Accesorios: <span className="font-bold">Bolsa y Aretes</span></div>
               </div>
            </div>
         </div>

         {/* Sección Hola Hermosa con foto Flotada (float-right) y bordes ondulados laterales */}
         <div className="relative mt-15 px-10 md:px-24 block overflow-hidden py-10">
            {/* Bordes ondulados fucsia anchos con base sólida a la izquierda */}
            <div className="absolute top-0 bottom-0 left-0 w-[50px] md:w-[70px] h-full pointer-events-none z-10 overflow-hidden">
               <svg className="w-full h-full">
                  <defs>
                     <pattern id="scallop-left" x="0" y="0" width="150" height="120" patternUnits="userSpaceOnUse">
                        <path d="M 0 0 L 20 0 Q 45 30 20 60 T 20 120 L 0 120 Z" fill="#e83d9c" />
                     </pattern>
                  </defs>
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#scallop-left)" />
               </svg>
            </div>

            {/* Bordes ondulados fucsia anchos con base sólida a la derecha */}
            <div className="absolute top-0 bottom-0 right-0 w-[50px] md:w-[70px] h-full pointer-events-none z-10 overflow-hidden">
               <svg className="w-full h-full">
                  <defs>
                     <pattern id="scallop-right" x="0" y="0" width="150" height="120" patternUnits="userSpaceOnUse">
                        <path d="M 70 0 L 50 0 Q 25 30 50 60 T 50 120 L 70 120 Z" fill="#e83d9c" />
                     </pattern>
                  </defs>
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#scallop-right)" />
               </svg>
            </div>

            {/* Imagen flotada a la derecha */}
            <img 
               src="/images/YO2.png" 
               alt="Abi Rosas - La Más Chispa" 
               className="float-right mb-6 w-full max-w-sm md:max-w-md lg:max-w-[500px] h-auto object-contain -rotate-[10deg]" 
            />

            {/* Título y Texto */}
            <div className="text-left font-poppins text-gray-800 text-base md:text-lg leading-relaxed">
               <span className="font-bodoni italic text-[48px] md:text-[50px] text-[#9c2868] block leading-tight">
                  Hola, hermosa 💖
               </span>
               <span className="font-bodoni italic text-[48px] md:text-[50px] text-[#9c2868] block leading-tight mb-6">
                  ¡Bienvenida a tu lugar seguro!
               </span>
               
               <p className="mb-4">
                  Soy Abi Rosas, la fundadora de <span className="font-bold">La Más Chispa</span>, y quiero contarte por qué 
                  este espacio está pensado exclusivamente para mujeres de talla grande.
               </p>
               <p className="mb-4">
                  Gran parte de mi vida he sido una chica plus size y, si tú también lo eres, seguramente sabes que encontrar ropa
                  no siempre es sencillo. Buscar variedad de tallas, encontrar diseños modernos y sentirte cómoda con lo que llevas
                  puesto muchas veces se convierte en toda una odisea.
               </p>
               <p className="mb-4">
                  En diciembre de 2023 me invitaron a una boda. Hacía muchos años que no rentaba un vestido y
                  pensé que sería una experiencia emocionante... pero fue todo lo contrario.
                  Me encontré con muy pocas opciones en mi talla, diseños que no representaban mi estilo y una
                  sensación constante de que tenía que conformarme con "lo que había", en lugar de elegir lo que
                  realmente me hacía sentir hermosa. A eso se sumaron algunos comentarios y actitudes que
                  hicieron que una experiencia que debía ser especial terminara siendo incómoda.
                  Al platicarlo con varias amigas, descubrí que muchas habían vivido exactamente lo mismo. Lo
                  más triste fue escuchar que ya lo tenían normalizado, porque pensaban que simplemente
                  "así son las cosas".
               </p>
               <p className="mb-4">Pero yo no estaba de acuerdo.</p>
               <p className="mb-4">
                  Ser una mujer de talla grande no debería significar tener menos opciones, conformarte con un vestido 
                  que no te encanta o sentirte juzgada. Al contrario. Cada evento importante merece ser vivido con ilusión, 
                  seguridad y emoción. Porque, seamos sinceras... ¿cada cuándo tenemos la oportunidad de usar un vestido de noche?
               </p>
               <p className="mb-4">Tú mereces elegir el vestido que te enamore, no el único que te quede.</p>
               <p className="font-bold mb-4">Y así nació La Más Chispa.</p>
               <p className="mb-4">
                  El 1 de abril de 2024, con 25 años, decidí abrir un espacio donde las mujeres plus size pudiéramos vivir una 
                  experiencia diferente: un lugar donde hubiera variedad de estilos, donde nos sintiéramos cómodas, escuchadas y 
                  bienvenidas; donde nadie tuviera que esconder su cuerpo para sentirse hermosa. Más que rentar vestidos, 
                  quiero que cada mujer que entre por nuestra puerta salga sintiéndose segura, feliz y con la emoción de haber 
                  encontrado <span className="font-bold">ese vestido perfecto</span>.
               </p>
               <p className="mb-4">
                  Gracias por estar aquí y por formar parte de este sueño. Espero conocerte muy pronto y ayudarte a encontrar 
                  el vestido con el que te sientas tan increíble como realmente eres.
               </p>
               <p>Con cariño,</p>
               <p className="font-bold text-xl">Abi Rosas</p>
            </div>

            {/* Clearfix para evitar desbordamientos */}
            <div className="clear-both"></div>
         </div>

         {/* Seccion de Tu eres nuestra mejor modelo */}
         <div className="relative mt-16 sm:mt-20 md:mt-24 bg-[#ffb727] text-center pt-8 sm:pt-12 md:pt-14 pb-28 sm:pb-36 md:pb-48 lg:pb-56">
            {/* Borde ondulado en la parte superior */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[99%] pointer-events-none">
               <svg className="relative block w-full h-8 sm:h-12 md:h-16 lg:h-20 text-[#ffb727]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path fill="currentColor" d="M0,60 Q30,110 60,60 T120,60 T180,60 T240,60 T300,60 T360,60 T420,60 T480,60 T540,60 T600,60 T660,60 T720,60 T780,60 T840,60 T900,60 T960,60 T1020,60 T1080,60 T1140,60 T1200,60 V120 H0 Z"></path>
               </svg>
            </div>

            <div className="px-4 flex flex-col items-center justify-center">
               <h2 className="font-bodoni italic text-[#9c2868] text-3xl sm:text-5xl md:text-6xl lg:text-[64px] leading-tight mb-6 md:mb-8 font-normal">
                  ¡Tu eres nuestra mejor modelo!
               </h2>
               
               <div className="flex flex-col items-center">
                  <div className="bg-[#e83d9c] text-white font-bodoni text-xl sm:text-3xl md:text-4xl lg:text-[44px] px-8 sm:px-12 md:px-16 py-2.5 sm:py-3.5 rounded-full z-10 shadow-sm">
                     Siguenos en nuestras redes
                  </div>
                  <div className="bg-[#e83d9c] text-white font-bodoni italic text-lg sm:text-2xl md:text-3xl lg:text-[36px] px-8 sm:px-10 md:px-14 py-1.5 sm:py-2.5 rounded-full -mt-3 sm:-mt-4 z-0 shadow-sm">
                     @lamaschispa
                  </div>
               </div>
            </div>

            {/* Galería de fotos horizontal en 5 columnas con esquinas rectangulares superpuestas abajo */}
            <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-2 sm:px-6 md:px-10 max-w-7xl mx-auto z-10">
               <div className="grid grid-cols-5 gap-1.5 sm:gap-3 md:gap-4 lg:gap-5">
                  <img src="/images/shineGold.jpg" alt="Vestido" className="w-full aspect-[3/4] object-cover rounded-none shadow-md" />
                  <img src="/images/rosaTopacio.jpg" alt="Vestido" className="w-full aspect-[3/4] object-cover rounded-none shadow-md" />
                  <img src="/images/redDress.jpg" alt="Vestido" className="w-full aspect-[3/4] object-cover rounded-none shadow-md" />
                  <img src="/images/pinkDress.jpg" alt="Vestido" className="w-full aspect-[3/4] object-cover rounded-none shadow-md" />
                  <img src="/images/goldPink.jpg" alt="Vestido" className="w-full aspect-[3/4] object-cover rounded-none shadow-md" />
               </div>
            </div>
         </div>

         {/* Espacio reservado para que las fotos que sobresalen no colisionen con lo que siga */}
         <div className="h-16 sm:h-28 md:h-36 lg:h-44"></div>

         {/* Sección Visítanos */}
         <div className="px-6 md:px-20 py-10 md:py-16 max-w-7xl mx-auto">
            <h2 className="font-bodoni italic text-[#9c2868] text-4xl sm:text-5xl md:text-6xl mb-8 md:mb-12 text-left">
               Visítanos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
               {/* Detalles de contacto y ubicación */}
               <div className="space-y-6 md:space-y-8 text-left font-poppins">
                  {/* Dirección con enlace directo a Google Maps */}
                  <a 
                     href="https://maps.app.goo.gl/T4bo7PgqL7Ei2vyA8" 
                     target="_blank" 
                     rel="noreferrer" 
                     className="flex items-start gap-4 group hover:opacity-90 transition-opacity"
                  >
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e83d9c] text-white flex items-center justify-center text-xl shrink-0 mt-1 shadow-sm group-hover:scale-105 transition-transform">
                        <FaMapMarkerAlt />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-800 text-lg md:text-xl group-hover:text-[#e83d9c] transition-colors flex items-center gap-2">
                           La Más Chispa
                           <span className="text-xs bg-[#e83d9c]/10 text-[#e83d9c] px-2 py-0.5 rounded-full font-normal">Abrir mapa ↗</span>
                        </h3>
                        <p className="text-gray-600 text-base md:text-lg">Calle Dr. Enrique C. Livas #250,</p>
                        <p className="text-gray-600 text-base md:text-lg">Cumbres 1er. Sector, 64610 Monterrey, N.L.</p>
                     </div>
                  </a>

                  {/* Horarios */}
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e83d9c] text-white flex items-center justify-center text-xl shrink-0 mt-1 shadow-sm">
                        <FaClock />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-800 text-lg md:text-xl">Horarios</h3>
                        <p className="text-gray-600 text-base md:text-lg">Lunes a Viernes 11 a.m. - 8 p.m.</p>
                        <p className="text-gray-600 text-base md:text-lg">Sábados de 11 a.m. - 5 p.m.</p>
                     </div>
                  </div>

                  {/* Teléfono / Whatsapp */}
                  <a 
                     href="https://wa.me/528120281520" 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-start gap-4 group hover:opacity-90 transition-opacity"
                  >
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e83d9c] text-white flex items-center justify-center text-xl shrink-0 mt-1 shadow-sm group-hover:scale-105 transition-transform">
                        <FaWhatsapp />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-800 text-lg md:text-xl group-hover:text-[#e83d9c] transition-colors">Teléfono / Whatsapp</h3>
                        <p className="text-gray-600 text-base md:text-lg">81 2028 1520</p>
                     </div>
                  </a>
               </div>

               {/* Mapa interactivo de Google Maps */}
               <div className="w-full h-[320px] sm:h-[360px] md:h-[400px] rounded-2xl overflow-hidden shadow-md border border-gray-200 relative group">
                  <iframe
                     title="Ubicación La Más Chispa"
                     src="https://maps.google.com/maps?q=La+M%C3%A1s+Chispa+Renta+de+Vestidos+Curvy+Calle+Dr.+Enrique+C.+Livas+250+Monterrey&t=&z=16&ie=UTF8&iwloc=&output=embed"
                     width="100%"
                     height="100%"
                     style={{ border: 0 }}
                     allowFullScreen=""
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
               </div>
            </div>
         </div>

         {/* Footer */}
         <footer className="bg-[#9c2868] text-white py-12 md:py-16 px-6 md:px-20 mt-12 md:mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center md:items-start text-center md:text-left">
               {/* Columna 1: Enlaces */}
               <div className="flex flex-col space-y-2 font-poppins text-sm md:text-base text-pink-100">
                  <Link to="/vestidos" className="hover:underline hover:text-white transition-colors">Catálogo</Link>
                  <Link to="/preguntas" className="hover:underline hover:text-white transition-colors">Preguntas Frecuentes</Link>
                  <Link to="/nosotras" className="hover:underline hover:text-white transition-colors">Nosotras</Link>
                  <Link to="/talla" className="hover:underline hover:text-white transition-colors">Guía de tallas</Link>
                  <Link to="/contacto" className="hover:underline hover:text-white transition-colors">Contacto</Link>
               </div>

               {/* Columna 2: Teléfono y Dirección */}
               <div className="flex flex-col space-y-2 font-poppins text-sm md:text-base text-pink-100">
                  <p className="font-semibold text-white text-base md:text-lg">81 2028 1520</p>
                  <p>
                     Lunes a Viernes 11 a.m. - 8 p.m.<br />
                     Sábados de 11 a.m. - 5 p.m.
                  </p>
                  <p className="pt-2">
                     Dr. Enrique C. Livas #250,<br />
                     Cumbres 1er. Sector, Mty, N.L.
                  </p>
               </div>

               {/* Columna 3: Logo e Iconos Sociales */}
               <div className="flex flex-col items-center md:items-end justify-center space-y-4">
                  <img src="/images/logo.png" alt="La Más Chispa" className="w-36 md:w-44 brightness-0 invert" />
                  <div className="flex items-center gap-3">
                     <a href="https://www.instagram.com/lamaschispa/profilecard/?igsh=emdmdXV3bm9vcW0=" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-xl hover:scale-105 transition-transform shadow">
                        <FaInstagram />
                     </a>
                     <a href="https://www.facebook.com/share/15crZa7MWF/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-lg hover:scale-105 transition-transform shadow">
                        <FaFacebookF />
                     </a>
                     <a href="https://www.tiktok.com/@lamaschispa?_t=8sNw0oVLf1R&_r=1" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-lg hover:scale-105 transition-transform shadow">
                        <FaTiktok />
                     </a>
                     <a href="https://wa.me/528120281520" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-lg hover:scale-105 transition-transform shadow">
                        <FaWhatsapp />
                     </a>
                  </div>
                  <span className="text-white font-bodoni italic text-lg md:text-xl">@lamaschispa</span>
               </div>
            </div>
         </footer>

      </>
   )
}