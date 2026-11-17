import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

export default function Home() {
   const [recientes, setRecientes] = useState([]);
   const [clienteIndex, setClienteIndex] = useState(0);
   const [visibleCount, setVisibleCount] = useState(3);
   const [isHovered, setIsHovered] = useState(false);
   const [touchStartX, setTouchStartX] = useState(null);

   const fotosClientes = [
      "/images/cliente 7.jpg",
      "/images/cliente 3.jpg",
      "/images/cliente 1.jpg",
      "/images/cliente 5.jpg",
      "/images/cliente 2.jpg",
   ];

   // Ajustar cantidad de fotos visibles según el ancho de pantalla (3 en celular, 4 en tablet/601px, 5 en PC)
   useEffect(() => {
      const updateVisible = () => {
         if (window.innerWidth >= 1024) {
            setVisibleCount(5);
         } else if (window.innerWidth >= 580) {
            setVisibleCount(4);
         } else {
            setVisibleCount(3);
         }
      };
      updateVisible();
      window.addEventListener('resize', updateVisible);
      return () => window.removeEventListener('resize', updateVisible);
   }, []);

   const maxIndex = Math.max(0, fotosClientes.length - visibleCount);

   // Corregir índice si la pantalla se redimensiona
   useEffect(() => {
      if (clienteIndex > maxIndex) {
         setClienteIndex(maxIndex);
      }
   }, [clienteIndex, maxIndex]);

   // Auto-play solo cuando hay fotos que no caben al mismo tiempo
   useEffect(() => {
      if (isHovered || maxIndex === 0) return;
      const timer = setInterval(() => {
         setClienteIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 3500);
      return () => clearInterval(timer);
   }, [isHovered, maxIndex]);

   const nextCliente = () => {
      if (maxIndex === 0) return;
      setClienteIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
   };

   const prevCliente = () => {
      if (maxIndex === 0) return;
      setClienteIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
   };

   const handleTouchStart = (e) => {
      setTouchStartX(e.touches[0].clientX);
   };

   const handleTouchEnd = (e) => {
      if (touchStartX === null || maxIndex === 0) return;
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (diff > 40) {
         nextCliente();
      } else if (diff < -40) {
         prevCliente();
      }
      setTouchStartX(null);
   };

   useEffect(() => {
      const fetchRecientes = async () => {
         try {
            const response = await fetch('/api/vestidos');
            if (!response.ok) throw new Error('Error al cargar los vestidos');
            const data = await response.json();
            setRecientes(data.slice(0, 6));
         } catch (err) {
            console.error(err);
         }
      };

      fetchRecientes();
   }, []);

   return (
      <>
         <div 
            className="relative overflow-hidden w-full flex flex-col items-center justify-center bg-[#9c2868] pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 lg:min-h-[calc(100vh-80px)] px-2 sm:px-4 md:px-6"
         >
            <div className="max-w-7xl w-full mx-auto relative flex flex-row items-center justify-between sm:justify-around lg:justify-between gap-1 sm:gap-4 md:gap-8 px-1 sm:px-2 md:px-6">
               {/* Sección 1: Esfera arriba y Cuadro abajo (Izquierda) */}
               <div className="flex flex-col items-center justify-center flex-shrink-0 z-10">
                  <img 
                     src="/images/bola disco.png" 
                     alt="Esfera disco izquierda" 
                     className="w-[clamp(28px,6vw,80px)] h-auto object-contain drop-shadow-md mb-2 sm:mb-3 md:mb-4 pointer-events-none [backface-visibility:hidden]" 
                  />
                  <img 
                     src="/images/cuadro de fotos.png" 
                     alt="Cuadro de fotos izquierda" 
                     className="w-[clamp(65px,19vw,290px)] h-auto object-contain -rotate-[6deg] md:-rotate-[8deg] drop-shadow-2xl [backface-visibility:hidden] [will-change:transform]"
                  />
               </div>

               {/* Sección 2: Contenido Central de Texto */}
               <div className="text-center relative z-20 flex-1 min-w-0 max-w-xl mx-auto px-1 sm:px-2 md:px-4">
                  <img 
                     src="/images/logo.png" 
                     alt="Logo" 
                     className="mx-auto block w-[clamp(85px,12vw,170px)] h-auto brightness-0 invert pb-2 sm:pb-3 md:pb-4" 
                  />

                  <p className="font-bodoni text-[clamp(16px,3.8vw,56px)] text-white leading-tight mb-2 sm:mb-3 md:mb-4">
                     Ten la <span className="font-pinyon">libertad</span> de<br />
                     usar lo que te haga <br />
                     sentir <span className="font-pinyon">única</span>
                  </p>

                  <div className="mt-1 sm:mt-2">
                     <span className="bg-[#e83d9c] rounded-full font-poppins text-[clamp(9px,1.3vw,18px)] font-bold italic text-white px-[clamp(8px,1.6vw,24px)] py-[clamp(3px,0.6vw,8px)] inline-block shadow-md whitespace-nowrap">
                        Vestidos Curvy / Tallas Extra
                     </span>
                  </div>

                  <span className="text-white block mt-1.5 sm:mt-2 font-medium text-[clamp(9px,1vw,14px)] tracking-wide opacity-90">
                     @lamaschispa
                  </span>
               </div>

               {/* Sección 3: Esfera arriba y Cuadro abajo (Derecha) */}
               <div className="flex flex-col items-center justify-center flex-shrink-0 z-10">
                  <img 
                     src="/images/bola disco.png" 
                     alt="Esfera disco derecha" 
                     className="w-[clamp(28px,6vw,80px)] h-auto object-contain drop-shadow-md mb-2 sm:mb-3 md:mb-4 pointer-events-none scale-x-[-1] [backface-visibility:hidden]" 
                  />
                  <img 
                     src="/images/cuadro de fotos 2.png" 
                     alt="Cuadro de fotos derecha" 
                     className="w-[clamp(65px,19vw,290px)] h-auto object-contain rotate-[6deg] md:rotate-[8deg] drop-shadow-2xl [backface-visibility:hidden] [will-change:transform]"
                  />
               </div>
            </div>

            {/* Borde ondulado en la parte inferior */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none z-20">
               <svg className="relative block w-full h-10 sm:h-14 md:h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path fill="currentColor" d="M0,60 Q30,110 60,60 T120,60 T180,60 T240,60 T300,60 T360,60 T420,60 T480,60 T540,60 T600,60 T660,60 T720,60 T780,60 T840,60 T900,60 T960,60 T1020,60 T1080,60 T1140,60 T1200,60 V120 H0 Z"></path>
               </svg>
            </div>
         </div>

         <div className="px-4 sm:px-6 md:px-20 mt-8 md:mt-10">
            {/* Título + Raya */}
            <div className="flex items-center gap-4">
               <span className="text-[#ffb727] text-[28px] sm:text-[36px] md:text-[50px] leading-tight font-bodoni">
                  Conoce a los <span className="font-pinyon">Recien llegados</span>
               </span>
               <div className="hidden sm:block w-20 h-[1px] bg-[#ffb727]"></div>
            </div>

            {/* Galería de fotos horizontal en una nueva línea */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-0 md:justify-between mt-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
               {recientes.map((vestido) => (
                  <Link key={vestido.id} to={`/producto/${vestido.id}`} className="flex-shrink-0 snap-start w-[calc((100vw-48px)/3)] sm:w-36 md:w-45">
                     {vestido.imagenes?.length > 0 ? (
                        <img src={'/images/' + vestido.imagenes[0]} alt={vestido.name} className="w-full aspect-[3/4] object-cover rounded-xl sm:rounded-2xl shadow-sm" />
                     ) : (
                        <div className="w-full aspect-[3/4] flex items-center justify-center text-2xl sm:text-4xl bg-gray-100 rounded-xl sm:rounded-2xl shadow-sm">👗</div>
                     )}
                  </Link>
               ))}
            </div>
         </div>

         <div className="px-4 sm:px-6 md:px-20 mt-10 md:mt-15 text-center">
            <span className="font-bodoni text-[30px] md:text-[50px]">¿Cómo Rentar?</span>
            <div className="bg-[#fff8f5] p-4 sm:p-8 md:p-10 font-poppins mt-5 text-xs sm:text-base">
               <div className="flex flex-row text-center justify-center items-start gap-4 sm:gap-12 md:gap-24 lg:gap-40">
                  <div className="flex-1 max-w-[190px] sm:max-w-[260px] md:max-w-xs flex flex-col items-center gap-2 sm:gap-3">
                     <img src="/images/Artboard 1.png" alt="" className="w-16 sm:w-24 md:w-auto max-w-full h-auto" />
                     <span>Encuentra el vestido <br className="hidden sm:inline" />perfecto aquí en nuestro catalogo <br className="hidden sm:inline" />o fisicamente en nuestra tienda</span>
                  </div>
                  <div className="flex-1 max-w-[190px] sm:max-w-[260px] md:max-w-xs flex flex-col items-center gap-2 sm:gap-3">
                     <img src="/images/Artboard 2.png" alt="" className="w-18 sm:w-24 md:w-auto max-w-full h-auto" />
                     <span>Acude a nuestra tienda <br className="hidden sm:inline" />para medirtelo y separarlo</span>
                  </div>
               </div>
               <div className="flex flex-wrap text-center justify-center gap-x-5 gap-y-2 mt-8 md:mt-10 text-base md:text-xl items-baseline">
                  <div className="font-bodoni text-2xl md:text-3xl w-full md:w-auto">Tu Renta incluye:</div>
                  <div className="font-bold">Tintorería</div>
                  <div className="font-bold">Ajustes</div>
                  <div>Accesorios: <span className="font-bold">Bolsa y Aretes</span></div>
               </div>
            </div>
         </div>

         {/* Sección Hola Hermosa con foto Flotada (float-right) y bordes ondulados laterales */}
         <div className="relative mt-0 md:mt-0 px-4 sm:px-10 md:px-24 block overflow-hidden py-8 md:py-10">
            {/* Bordes ondulados fucsia anchos con base sólida a la izquierda */}
            {/* <div className="absolute top-0 bottom-0 left-0 w-[50px] md:w-[70px] h-full pointer-events-none z-10 overflow-hidden">
               <svg className="w-full h-full">
                  <defs>
                     <pattern id="scallop-left" x="0" y="0" width="150" height="120" patternUnits="userSpaceOnUse">
                        <path d="M 0 0 L 20 0 Q 45 30 20 60 T 20 120 L 0 120 Z" fill="#e83d9c" />
                     </pattern>
                  </defs>
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#scallop-left)" />
               </svg>
            </div> */}

            {/* Bordes ondulados fucsia anchos con base sólida a la derecha */}
            {/* <div className="absolute top-0 bottom-0 right-0 w-[50px] md:w-[70px] h-full pointer-events-none z-10 overflow-hidden">
               <svg className="w-full h-full">
                  <defs>
                     <pattern id="scallop-right" x="0" y="0" width="150" height="120" patternUnits="userSpaceOnUse">
                        <path d="M 70 0 L 50 0 Q 25 30 50 60 T 50 120 L 70 120 Z" fill="#e83d9c" />
                     </pattern>
                  </defs>
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#scallop-right)" />
               </svg>
            </div> */}

            {/* Imagen flotada a la derecha */}
            <img 
               src="/images/YO2.png" 
               alt="Abi Rosas - La Más Chispa" 
               className="block float-right ml-3 mb-2 w-[40%] max-w-[180px] sm:max-w-[300px] min-[1128px]:ml-0 min-[1128px]:mb-6 min-[1128px]:w-full min-[1128px]:max-w-[500px] h-auto object-contain -rotate-[10deg]"
            />

            {/* Título y Texto */}
            <div className="text-left pl-0 sm:pl-3 font-poppins text-gray-800 text-[15px] md:text-lg leading-relaxed">
               <span className="font-bodoni italic text-[24px] sm:text-[30px] md:text-[36px] text-[#9c2868] block leading-tight">
                  Hola, hermosa 💖
               </span>
               <span className="font-bodoni italic text-[24px] sm:text-[30px] md:text-[36px] text-[#9c2868] block leading-tight mb-6">
                  ¡Bienvenida a tu lugar seguro!
               </span>
               
               <p className="mb-2 sm:mb-4 text-xs sm:text-base">
                  Soy Abi Rosas, y quiero contarte cómo nació La Más Chispa. 💗
               </p>
               <p className="mb-2 sm:mb-4 text-xs sm:text-base">
                  Durante gran parte de mi vida he sido una chica plus size, así que sé lo complicado que puede ser encontrar ropa bonita, 
                  moderna y que realmente vaya con tu estilo.
               </p>
               <p className="mb-2 sm:mb-4 text-xs sm:text-base">
                  En diciembre de 2023 me invitaron a una boda y, después de muchos años sin rentar un vestido, 
                  pensé que sería una experiencia bonita. Pero me encontré con muy poquitas opciones en mi talla, 
                  vestidos anticuados y una sensación de tener que conformarme con lo que había.
               </p>
               <p className="mb-2 sm:mb-4 text-xs sm:text-base">
                  Cuando platiqué de esto con amigas, me di cuenta de que no era la única. Muchas habíamos pasado por situaciones similares y, 
                  tristemente, ya lo veíamos como algo normal.

                  Y yo pensaba: ¿por qué tenemos que conformarnos? 
                  ¿Por qué no podemos encontrar un vestido que realmente nos encante y con el que nos sintamos increíbles?
               </p>
               <p className="mb-2 sm:mb-4 text-xs sm:text-base">
                  Fue así como nació La Más Chispa, el 1 de abril de 2024. 
                  Con 25 años decidí crear ese espacio que a mí me hubiera gustado encontrar: 
                  un lugar donde las chicas de talla grande pudiéramos elegir entre diferentes estilos, sentirnos cómodas, 
                  disfrutar el proceso y, sobre todo, no sentir que tenemos que esconder nuestro cuerpo para vernos bonitas.
               </p>
               <p className="mb-2 sm:mb-4 text-xs sm:text-base">
                  Mi intención va mucho más allá de rentar vestidos. Quiero que cada chica que nos visite se emocione al encontrar su vestido, 
                  que se mire al espejo y diga: ¡este es! Que se sienta bonita, segura y feliz con lo que ve.
               </p>
               <p className="mb-2 sm:mb-4 text-xs sm:text-base">
                  Porque hay algo que quiero que siempre recuerdes: mereces elegir el vestido que te enamora, no el que te queda.
                  Gracias por formar parte de este sueño y por permitirnos acompañarte en momentos tan especiales.
               </p>
               {/* <p className="text-xs sm:text-base">Con cariño,</p> */}
               <p className="font-bold text-xs sm:text-base">¡Espero verte pronto en La Más Chispa!</p>
            </div>

            {/* Clearfix para evitar desbordamientos */}
            <div className="clear-both"></div>
         </div>

         {/* Seccion de Tu eres nuestra mejor modelo */}
         <div className="relative mt-5 sm:mt-20 md:mt-24 bg-[#ffb727] text-center pt-8 sm:pt-12 md:pt-14 pb-32 sm:pb-52 md:pb-64 lg:pb-48">
            {/* Borde ondulado en la parte superior */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[99%] pointer-events-none">
               <svg className="relative block w-full h-8 sm:h-12 md:h-16 lg:h-20 text-[#ffb727]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path fill="currentColor" d="M0,60 Q30,110 60,60 T120,60 T180,60 T240,60 T300,60 T360,60 T420,60 T480,60 T540,60 T600,60 T660,60 T720,60 T780,60 T840,60 T900,60 T960,60 T1020,60 T1080,60 T1140,60 T1200,60 V120 H0 Z"></path>
               </svg>
            </div>

            <div className="px-4 flex flex-col items-center justify-center">
               <h2 className="font-bodoni italic text-[#9c2868] text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight mb-4 sm:mb-6 font-normal">
                  ¡Tu eres nuestra mejor modelo!
               </h2>
               
               <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5">
                  <div className="bg-[#e83d9c] text-white font-bodoni text-lg sm:text-2xl md:text-3xl lg:text-[38px] px-6 sm:px-10 md:px-14 py-2 sm:py-3 rounded-full shadow-sm">
                     Siguenos en nuestras redes
                  </div>
                  <div className="bg-[#e83d9c] text-white px-5 sm:px-8 md:px-10 py-1.5 sm:py-2.5 rounded-full shadow-sm flex items-center justify-center gap-2.5 sm:gap-4 whitespace-nowrap">
                     <span className="font-bodoni italic text-base sm:text-xl md:text-2xl lg:text-[30px]">
                        @lamaschispa
                     </span>
                     <div className="flex items-center gap-2 sm:gap-3">
                        <a 
                           href="https://www.instagram.com/lamaschispa?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" 
                           target="_blank" 
                           rel="noreferrer" 
                           className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white text-[#e83d9c] flex items-center justify-center text-sm sm:text-base md:text-lg hover:scale-110 hover:bg-[#9c2868] hover:text-white transition-all shadow-sm"
                           aria-label="Instagram"
                        >
                           <FaInstagram />
                        </a>
                        <a 
                           href="https://www.facebook.com/share/15crZa7MWF/?mibextid=wwXIfr" 
                           target="_blank" 
                           rel="noreferrer" 
                           className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white text-[#e83d9c] flex items-center justify-center text-xs sm:text-sm md:text-base hover:scale-110 hover:bg-[#9c2868] hover:text-white transition-all shadow-sm"
                           aria-label="Facebook"
                        >
                           <FaFacebookF />
                        </a>
                        <a 
                           href="https://www.tiktok.com/@lamaschispa?_t=8sNw0oVLf1R&_r=1" 
                           target="_blank" 
                           rel="noreferrer" 
                           className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white text-[#e83d9c] flex items-center justify-center text-xs sm:text-sm md:text-base hover:scale-110 hover:bg-[#9c2868] hover:text-white transition-all shadow-sm"
                           aria-label="TikTok"
                        >
                           <FaTiktok />
                        </a>
                     </div>
                  </div>
               </div>
            </div>

            {/* Carrusel de fotos de clientas superpuesto abajo (3 en celular, se adapta a las que quepan en tablet y PC) */}
            <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-2 sm:px-6 md:px-10 max-w-sm min-[580px]:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto z-10">
               <div className="relative">
                  {/* Botón Anterior (solo cuando hay fotos ocultas fuera de pantalla) */}
                  {maxIndex > 0 && (
                     <button 
                        type="button"
                        onClick={prevCliente}
                        className="absolute -left-2 sm:-left-4 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#9c2868] hover:bg-[#e83d9c] hover:text-white shadow-md flex items-center justify-center text-sm sm:text-base transition-all cursor-pointer border border-pink-100"
                        aria-label="Foto anterior"
                     >
                        ❮
                     </button>
                  )}

                  {/* Contenedor del Carrusel */}
                  <div 
                     className="overflow-hidden w-full px-1"
                     onMouseEnter={() => setIsHovered(true)}
                     onMouseLeave={() => setIsHovered(false)}
                     onTouchStart={handleTouchStart}
                     onTouchEnd={handleTouchEnd}
                  >
                     <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                           transform: `translateX(-${clienteIndex * (100 / visibleCount)}%)`,
                        }}
                     >
                        {fotosClientes.map((foto, index) => (
                           <div 
                              key={index} 
                              className="flex-shrink-0 px-1 sm:px-2 md:px-2.5"
                              style={{ width: `${100 / visibleCount}%` }}
                           >
                              <img 
                                 src={foto} 
                                 alt={`Cliente La Más Chispa ${index + 1}`} 
                                 className="w-full aspect-[3/4] object-cover rounded-lg sm:rounded-xl shadow-lg"
                              />
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Botón Siguiente (solo cuando hay fotos ocultas fuera de pantalla) */}
                  {maxIndex > 0 && (
                     <button 
                        type="button"
                        onClick={nextCliente}
                        className="absolute -right-2 sm:-right-4 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/95 text-[#9c2868] hover:bg-[#e83d9c] hover:text-white shadow-md flex items-center justify-center text-sm sm:text-base transition-all cursor-pointer border border-pink-100"
                        aria-label="Siguiente foto"
                     >
                        ❯
                     </button>
                  )}

                  {/* Indicadores / Puntos (solo cuando hay más de 1 página de desplazamiento) */}
                  {maxIndex > 0 && (
                     <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                           <button
                              key={idx}
                              type="button"
                              onClick={() => setClienteIndex(idx)}
                              className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                                 clienteIndex === idx ? 'w-5 sm:w-6 bg-[#e83d9c]' : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'
                              }`}
                              aria-label={`Ir al grupo ${idx + 1}`}
                           />
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Espacio reservado para que las fotos que sobresalen no colisionen con lo que siga */}
         <div className="h-28 sm:h-44 md:h-56 lg:h-48"></div>

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
         <footer className="bg-[#9c2868] text-white py-10 sm:py-12 md:py-14 lg:py-16 px-4 sm:px-6 md:px-10 lg:px-20 mt-12 md:mt-16">
            <div className="max-w-7xl mx-auto grid grid-cols-2 min-[580px]:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-start text-left">
               {/* Columna 1: Enlaces */}
               <div className="flex flex-col space-y-2 font-poppins text-xs sm:text-sm md:text-base text-pink-100">
                  <span className="font-bodoni text-white text-sm sm:text-base md:text-lg font-semibold mb-1">Explora</span>
                  <Link to="/vestidos" className="hover:underline hover:text-white transition-colors">Catálogo</Link>
                  <Link to="/preguntas" className="hover:underline hover:text-white transition-colors">Preguntas Frecuentes</Link>
                  <Link to="/nosotras" className="hover:underline hover:text-white transition-colors">Nosotras</Link>
                  <Link to="/talla" className="hover:underline hover:text-white transition-colors">Guía de tallas</Link>
                  <Link to="/contacto" className="hover:underline hover:text-white transition-colors">Contacto</Link>
               </div>

               {/* Columna 2: Teléfono y Dirección */}
               <div className="flex flex-col space-y-2 font-poppins text-xs sm:text-sm md:text-base text-pink-100">
                  <span className="font-bodoni text-white text-sm sm:text-base md:text-lg font-semibold mb-1">Contacto</span>
                  <p className="font-semibold text-white text-xs sm:text-sm md:text-base">81 2028 1520</p>
                  <p>
                     <span className="font-semibold text-white">Lunes a Viernes</span><br />
                     11 a.m. - 8 p.m.<br /><br />
                    <span className="font-semibold text-white">Sábados</span><br />
                     11 a.m. - 5 p.m.
                  </p>
                  <p className="pt-1 font-semibold text-white">
                     Dr. Enrique C. Livas #250,<br />
                     Cumbres 1er. Sector, Mty, N.L.
                  </p>
               </div>

               {/* Columna 3: Logo e Iconos Sociales */}
               <div className="col-span-2 min-[580px]:col-span-1 flex flex-col items-center min-[580px]:items-end justify-center space-y-3 pt-6 min-[580px]:pt-0 border-t border-pink-400/20 min-[580px]:border-t-0 text-center min-[580px]:text-right">
                  <img src="/images/logo.png" alt="La Más Chispa" className="w-32 sm:w-36 md:w-44 brightness-0 invert" />
                  <div className="flex items-center gap-2.5 sm:gap-3">
                     <a href="https://www.instagram.com/lamaschispa/profilecard/?igsh=emdmdXV3bm9vcW0=" target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-lg sm:text-xl hover:scale-105 transition-transform shadow" aria-label="Instagram">
                        <FaInstagram />
                     </a>
                     <a href="https://www.facebook.com/share/15crZa7MWF/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-base sm:text-lg hover:scale-105 transition-transform shadow" aria-label="Facebook">
                        <FaFacebookF />
                     </a>
                     <a href="https://www.tiktok.com/@lamaschispa?_t=8sNw0oVLf1R&_r=1" target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-base sm:text-lg hover:scale-105 transition-transform shadow" aria-label="TikTok">
                        <FaTiktok />
                     </a>
                     <a href="https://wa.me/528120281520" target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#9c2868] flex items-center justify-center text-base sm:text-lg hover:scale-105 transition-transform shadow" aria-label="WhatsApp">
                        <FaWhatsapp />
                     </a>
                  </div>
                  <span className="text-white font-bodoni italic text-base sm:text-lg md:text-xl">@lamaschispa</span>
               </div>
            </div>
         </footer>

      </>
   )
}