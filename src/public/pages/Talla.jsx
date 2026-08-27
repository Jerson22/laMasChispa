export default function Talla() {
   const sizeData = [
      {
         label: "Talla 0 XL",
         mexicana: ["10 – 13", "34 – 36"],
         americana: "10 – 12",
      },
      {
         label: "Talla 1 XL",
         mexicana: ["13 – 15", "36 – 38"],
         americana: "14 – 16",
      },
      {
         label: "Talla 2 XL",
         mexicana: ["15 – 17", "38 – 40"],
         americana: "18 – 20",
      },
      {
         label: "Talla 3 XL",
         mexicana: ["17 – 20", "40 – 42"],
         americana: "22 – 24",
      },
      {
         label: "Talla 4 XL",
         mexicana: ["20 – 23", "42 – 44"],
         americana: "26 – 28",
      },
      {
         label: "Talla 5 XL",
         mexicana: ["23 – 25", "44 – 46"],
         americana: "30 – 32",
      },
   ];

   return (
      <div className="bg-[#fff8f5] min-h-[calc(100vh-80px)] py-12 md:py-20 px-4 sm:px-6 md:px-12 font-poppins">
         <div className="max-w-4xl mx-auto text-center">
            {/* Título Principal */}
            <h1 className="font-bodoni text-4xl sm:text-5xl md:text-6xl text-[#2c2c2c] tracking-[0.2em] font-normal mb-8 uppercase">
               GUIA DE TALLAS
            </h1>

            {/* Mensaje Inspirador */}
            <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-12 md:mb-16 font-light">
               Prométenos algo: nunca dejes que una talla te haga dudar de lo hermosa que eres. Las tallas son solo una referencia, nunca una definición porque las tallas cambian, los cuerpos cambian y tu belleza no se mide en números ni tu valor cabe en una etiqueta. Aquí queremos te concentres en lo que realmente importa: encontrar un vestido en el que te hace sentir segura, auténtica y hermosa siendo tú.
            </p>

            {/* Tabla de Tallas */}
            <div className="max-w-2xl mx-auto overflow-x-auto">
               <table className="w-full text-center border-collapse">
                  <thead>
                     <tr>
                        <th className="pb-6"></th>
                        <th className="font-bold text-gray-800 text-base sm:text-lg md:text-xl pb-6">
                           Talla Mexicana
                        </th>
                        <th className="font-bold text-gray-800 text-base sm:text-lg md:text-xl pb-6">
                           Talla Americana
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-400">
                     {sizeData.map((item, index) => (
                        <tr key={index} className="border-t border-gray-400">
                           <td className="py-5 md:py-6 font-bold text-gray-800 text-base sm:text-lg text-left sm:text-center">
                              {item.label}
                           </td>
                           <td className="py-5 md:py-6 text-gray-800 text-base sm:text-lg font-normal">
                              {item.mexicana[0]} <br />
                              {item.mexicana[1]}
                           </td>
                           <td className="py-5 md:py-6 text-gray-800 text-base sm:text-lg font-normal">
                              {item.americana}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
