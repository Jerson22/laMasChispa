import { FaMapMarkerAlt, FaClock, FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

export default function Contacto() {
   return (
      <div className="py-8 md:py-14 px-4 sm:px-6">
         {/* Título de la Página */}
         <div className="text-center mb-10 md:mb-14">
            <h1 className="font-bodoni text-4xl sm:text-5xl md:text-6xl text-gray-800 tracking-wide">
               Contacto
            </h1>
         </div>

         {/* Tarjeta Dividida: Información + Mapa */}
         <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2">
            {/* Lado Izquierdo: Fondo crema/rosa suave con información */}
            <div className="bg-[#fff8f5] p-8 sm:p-10 md:p-12 text-left font-poppins flex flex-col justify-center space-y-6 sm:space-y-8">
               <h2 className="font-bodoni italic text-[#9c2868] text-3xl sm:text-4xl md:text-5xl font-normal mb-2">
                  Visítanos
               </h2>

               {/* Dirección */}
               <a 
                  href="https://maps.app.goo.gl/T4bo7PgqL7Ei2vyA8" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-start gap-4 group hover:opacity-90 transition-opacity"
               >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e83d9c] text-white flex items-center justify-center text-lg shrink-0 mt-1 shadow-sm group-hover:scale-105 transition-transform">
                     <FaMapMarkerAlt />
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#e83d9c] transition-colors">La Más Chispa</h3>
                     <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Calle Dr. Enrique C. Livas #250,</p>
                     <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Cumbres 1er. Sector,</p>
                     <p className="text-gray-600 text-sm sm:text-base leading-relaxed">64610 Monterrey, N.L.</p>
                  </div>
               </a>

               {/* Horarios */}
               <div className="flex items-start gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e83d9c] text-white flex items-center justify-center text-lg shrink-0 mt-1 shadow-sm">
                     <FaClock />
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-800 text-lg">Horarios</h3>
                     <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Lunes a Viernes 11 a.m. - 8 p.m.</p>
                     <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Sábados de 11 a.m. - 5 p.m.</p>
                  </div>
               </div>

               {/* Teléfono / Whatsapp */}
               <a 
                  href="https://wa.me/528120281520" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-start gap-4 group hover:opacity-90 transition-opacity"
               >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e83d9c] text-white flex items-center justify-center text-lg shrink-0 mt-1 shadow-sm group-hover:scale-105 transition-transform">
                     <FaWhatsapp />
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#e83d9c] transition-colors">Teléfono / Whatsapp</h3>
                     <p className="text-gray-600 text-sm sm:text-base">81 2028 1520</p>
                  </div>
               </a>
            </div>

            {/* Lado Derecho: Mapa Interactivo de Google Maps */}
            <div className="w-full min-h-[340px] sm:min-h-[400px] md:min-h-full">
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

         {/* Iconos de Redes Sociales en la parte inferior */}
         <div className="flex justify-center items-center gap-4 sm:gap-6 mt-12 md:mt-16 mb-8">
            <a 
               href="https://www.instagram.com/lamaschispa/profilecard/?igsh=emdmdXV3bm9vcW0=" 
               target="_blank" 
               rel="noreferrer" 
               className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#9c2868] text-white flex items-center justify-center text-2xl sm:text-3xl hover:scale-110 transition-transform shadow-md"
            >
               <FaInstagram />
            </a>
            <a 
               href="https://www.facebook.com/share/15crZa7MWF/?mibextid=wwXIfr" 
               target="_blank" 
               rel="noreferrer" 
               className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#9c2868] text-white flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-transform shadow-md"
            >
               <FaFacebookF />
            </a>
            <a 
               href="https://www.tiktok.com/@lamaschispa?_t=8sNw0oVLf1R&_r=1" 
               target="_blank" 
               rel="noreferrer" 
               className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#9c2868] text-white flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-transform shadow-md"
            >
               <FaTiktok />
            </a>
            <a 
               href="https://wa.me/528120281520" 
               target="_blank" 
               rel="noreferrer" 
               className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#9c2868] text-white flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-transform shadow-md"
            >
               <FaWhatsapp />
            </a>
         </div>
      </div>
   );
}
