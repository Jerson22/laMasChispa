export default function Preguntas() {
   const faqList = [
      {
         question: "¿Se necesita sacar cita para ir?",
         answer: (
            <>
               <p className="font-bold text-gray-900 mb-1">¡No necesitas cita!</p>
               <p className="text-gray-700 leading-relaxed">
                  Ven cuando tú quieras dentro de nuestro horario de: Lunes a Viernes 11 a.m. - 8 p.m. y Sábados de 11 a.m. - 5 p.m.
               </p>
            </>
         ),
      },
      {
         question: "¿Cuáles son las tallas manejan?",
         answer: (
            <>
               <p className="text-gray-700 leading-relaxed">
                  Manejamos desde la <span className="font-bold text-gray-900">Talla 1 XL hasta la Talla 5 XL</span>
               </p>
               <p className="font-bold text-gray-900 mt-1">¡Tallas reales!</p>
            </>
         ),
      },
      {
         question: "¿Cuantos días incluye mi renta?",
         answer: (
            <>
               <p className="text-gray-700 leading-relaxed">
                  Recoge tu vestido un día antes del evento y lo entregas al día siguiente.
               </p>
               <p className="italic text-gray-600 mt-1 leading-relaxed">
                  Si tu evento es el sábado, la entrega se realiza el lunes, ya que los domingos no abrimos
               </p>
            </>
         ),
      },
      {
         question: "¿Con cuanto tiempo antes puedo rentar mi vestido?",
         answer: (
            <>
               <p className="text-gray-700 leading-relaxed mb-1">
                  Recomendamos rentar tu vestido con 3 semanas de anticipación para que tengas más opciones disponibles
               </p>
               <p className="text-gray-700 leading-relaxed">
                  Aun así, puedes hacerlo cuando gustes: un mes antes, una semana antes o en renta express el mismo día (tomando en cuenta los términos de la renta express).
               </p>
            </>
         ),
      },
      {
         question: "¿Que precio tiene la renta?",
         answer: (
            <p className="text-gray-700 leading-relaxed">
               La renta depende del vestido van desde los $600 a $1900
            </p>
         ),
      },
      {
         question: "¿Como separo mi vestido?",
         answer: (
            <p className="text-gray-700 leading-relaxed">
               Para apartar tu vestido, se requiere un <span className="font-bold text-gray-900">anticipo del 50% del total de la renta</span>. Puedes hacerlo en el local o, si ya nos visitaste y te decidiste después, mándanos un mensaje a nuestras redes con la foto del vestido y te pasamos los datos para la transferencia y ¡Listo! Tu vestido queda separado.
            </p>
         ),
      },
      {
         question: "¿Que pasa si quiero cancelar mi renta?",
         answer: (
            <p className="text-gray-700 leading-relaxed">
               Por cancelación, <span className="font-bold text-gray-900">el anticipo no es reembolsable, ni transferible</span>. El anticipo corresponde al 50% del costo total de la renta. Gracias por tu comprensión.
            </p>
         ),
      },
      {
         question: "¿Te vas de viaje y necesitas el vestido más días?",
         answer: (
            <p className="text-gray-700 leading-relaxed">
               Los <span className="font-bold text-gray-900">días extras</span> tienen un <span className="font-bold text-gray-900">costo de $100</span>.
            </p>
         ),
      },
      {
         question: "¿Tengo que lavar el vestido antes de entregarlo?",
         answer: (
            <>
               <p className="text-gray-700 leading-relaxed">
                  No para nada en <span className="font-bold text-gray-900">tu renta ya incluye la tintorería</span> de tu vestido. <span className="italic text-gray-600">(Cualquier daño, mancha irreparable o pérdida en la prenda generará un cargo adicional equivalente al costo de reparación o, en su caso, al valor comercial del vestido)</span>
               </p>
            </>
         ),
      },
      {
         question: "Que pasa si no alcanzo a entregar el vestido en la fecha acordada.",
         answer: (
            <p className="text-gray-700 leading-relaxed">
               En caso de retraso, se aplicará una <span className="font-bold text-gray-900">multa de $100 por cada día de atraso</span>. Gracias por tu comprensión.
            </p>
         ),
      },
      {
         question: "¿Puedo cambiar mi vestido?",
         answer: (
            <>
               <p className="text-gray-700 leading-relaxed">
                  Si claro que si. Puedes cambiar tu vestido. <span className="font-bold text-gray-900">El cambio tiene un costo de $250 pesos</span>
               </p>
               <p className="text-gray-700 leading-relaxed mt-0.5">
                  En caso de que el nuevo vestido tenga un precio mayor, se deberá cubrir la diferencia.
               </p>
            </>
         ),
      },
      {
         question: "¿A qué hora puedo pasar por mi vestido?",
         answer: (
            <p className="text-gray-700 leading-relaxed">
               Puedes pasar por tu vestido <span className="font-bold text-gray-900">después de la 1 pm hasta la hora de cierre.</span>
            </p>
         ),
      },
      {
         question: "¿Cuentan con Renta Express?",
         answer: (
            <>
               <p className="text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-900">¡Si claro que Si!</span> La Renta Express es cuando rentas tu vestido el mismo dia de tu evento o un dia antes.
               </p>
               <p className="text-gray-700 leading-relaxed">
                  Te incluye los Accesorios (Bolsa y Aretes).
               </p>
               <p className="italic text-gray-600 mt-1 leading-relaxed">
                  <span className="font-bold not-italic">Importante:</span>
                  <br />
                  La renta express no incluye ajustes. Si necesitas algún ajuste, tendrá costo adicional y están sujetos a disponibilidad. En días de mucho trabajo, puede que no sea posible realizarlos.
               </p>
            </>
         ),
      },
   ];

   return (
      <div className="bg-[#fff8f5] min-h-[calc(100vh-80px)] py-12 md:py-20 px-4 sm:px-6 md:px-12 font-poppins">
         <div className="max-w-4xl mx-auto">
            {/* Título Principal */}
            <h1 className="font-bodoni text-4xl sm:text-5xl md:text-6xl text-[#2c2c2c] text-center font-normal mb-12 md:mb-16">
               Preguntas Frecuentes
            </h1>

            {/* Lista de Preguntas y Respuestas */}
            <div className="space-y-8 sm:space-y-10 md:space-y-12 max-w-3xl text-left">
               {faqList.map((faq, index) => (
                  <div key={index} className="flex flex-col items-start">
                     {/* Botón/Pill de la pregunta en fucsia */}
                     <span className="bg-[#e83d9c] text-white font-bold text-sm sm:text-base md:text-lg px-6 py-2.5 rounded-full shadow-sm mb-3 inline-block">
                        {faq.question}
                     </span>
                     {/* Respuesta */}
                     <div className="pl-2 sm:pl-3 text-base sm:text-lg">
                        {faq.answer}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
