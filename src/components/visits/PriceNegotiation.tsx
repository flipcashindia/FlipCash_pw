// import React, { useState } from 'react';
// import { formatCurrency } from '../../utils/formatters';
// import { Button } from '../common/Button';

// interface PriceNegotiationProps {
//   estimatedPrice: number;
//   recommendedPrice: number;
//   onAccept: () => void;
//   onCounterOffer: (price: number) => void;
// }

// const PriceNegotiation: React.FC<PriceNegotiationProps> = ({ estimatedPrice, recommendedPrice, onAccept, onCounterOffer }) => {
//   const [counterPrice, setCounterPrice] = useState(recommendedPrice);

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Price Negotiation</h2>
//       <div className="space-y-4">
//         <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
//           <span>Original Estimate</span>
//           <span className="font-bold">{formatCurrency(estimatedPrice)}</span>
//         </div>
//         <div className="flex justify-between p-4 bg-teal-50 rounded-lg">
//           <span>Your Recommended Price</span>
//           <span className="font-bold text-teal-600">{formatCurrency(recommendedPrice)}</span>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Counter Offer (₹)</label>
//           <input type="number" value={counterPrice} onChange={(e) => setCounterPrice(parseFloat(e.target.value))} className="w-full p-3 border rounded-lg" />
//         </div>
//         <div className="flex gap-3">
//           <Button onClick={onAccept} variant="primary" size="lg" className="flex-1">
//             Accept {formatCurrency(recommendedPrice)}
//           </Button>
//           <Button onClick={() => onCounterOffer(counterPrice)} variant="outline" size="lg" className="flex-1">
//             Send Counter Offer
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceNegotiation;