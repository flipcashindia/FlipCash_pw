// import React, { useEffect } from 'react';
// import { useCatalog } from '../../hooks/useCatalog';

// const TopBrands: React.FC = () => {
//   const { brands, loadBrands } = useCatalog();

//   useEffect(() => {
//     loadBrands();
//   }, []);

//   return (
//     <section className="py-16 bg-gray-50">
//       <div className="container mx-auto px-4 md:px-6">
//         <h2 className="text-4xl font-bold text-center mb-12">Top Brands</h2>
//         <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
//           {brands.slice(0, 12).map((brand) => (
//             <div key={brand.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
//               {brand.logo_url && (
//                 <img src={brand.logo_url} alt={brand.name} className="w-full h-16 object-contain" />
//               )}
//               <p className="text-center text-sm font-semibold mt-2">{brand.name}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default TopBrands;