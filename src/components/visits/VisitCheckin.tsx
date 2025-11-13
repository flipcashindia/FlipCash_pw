// import React, { useState } from 'react';
// import { MapPin, Navigation } from 'lucide-react';
// import { useGeolocation } from '../../hooks/useGeolocation';
// import { visitsService } from '../../api/services/visitsService';
// import { useToast } from '../../contexts/ToastContext';
// import { type Visit } from '../../types/visit.types';
// import { Button } from '../common/Button';

// interface VisitCheckinProps {
//   visit: Visit;
//   onCheckinSuccess: () => void;
// }

// const VisitCheckin: React.FC<VisitCheckinProps> = ({ visit, onCheckinSuccess }) => {
//   const { location, loading, getLocation } = useGeolocation();
//   const toast = useToast();
//   const [checking, setChecking] = useState(false);

//   const handleCheckin = async () => {
//     try {
//       setChecking(true);
//       const coords = location || await getLocation();
//       await visitsService.checkin(visit.id, { location: coords });
//       toast.success('Checked in successfully');
//       onCheckinSuccess();
//     } catch (error) {
//       toast.error('Failed to check in');
//     } finally {
//       setChecking(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Check-in</h2>
//       <div className="space-y-4">
//         <div className="flex items-start gap-3">
//           <MapPin className="w-5 h-5 text-teal-600 mt-1" />
//           <div>
//             <p className="font-medium">Customer Address</p>
//             <p className="text-sm text-gray-600">{visit.lead}</p>
//           </div>
//         </div>
//         {location && (
//           <div className="bg-green-50 p-3 rounded-lg">
//             <p className="text-sm text-green-800">Location acquired</p>
//           </div>
//         )}
//         <Button
//           onClick={handleCheckin}
//           loading={checking || loading}
//           variant="primary"
//           size="lg"
//           className="w-full"
//         >
//           <Navigation size={20} className="mr-2" />
//           Check In Now
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default VisitCheckin;