// import React, { useState } from 'react';
// import { useImageUpload } from '../../hooks/useImageUpload';
// import { visitsService } from '../../api/services/visitsService';
// import { useToast } from '../../contexts/ToastContext';
// import { ImageUploader } from '../common/ImageUploader';
// import { Button } from '../common/Button';

// interface DeviceInspectionProps {
//   visitId: string;
//   onSubmitSuccess: () => void;
// }

// const DeviceInspection: React.FC<DeviceInspectionProps> = ({ visitId, onSubmitSuccess }) => {
//   const toast = useToast();
//   const { uploadImages } = useImageUpload();
//   const [submitting, setSubmitting] = useState(false);
//   const [images, setImages] = useState<File[]>([]);
//   const [inspection, setInspection] = useState({
//     body: 'good',
//     screen: 'good',
//     battery_health: 80,
//     imei_verified: false,
//     recommended_price: 0,
//     notes: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setSubmitting(true);
//       const imageUrls = images.length > 0 ? await uploadImages(images) : [];
//       await visitsService.submitInspection(visitId, {
//         inspection_data: {
//           physical_condition: { body: inspection.body, screen: inspection.screen, camera: 'good', buttons: 'good', ports: 'good' },
//           functional_tests: { display: true, touch: true, wifi: true, bluetooth: true, camera_front: true, camera_back: true, speaker: true, microphone: true, charging: true, battery_health: inspection.battery_health },
//           imei_verified: inspection.imei_verified,
//           accessories_present: [],
//           inspection_images: imageUrls,
//           inspector_notes: inspection.notes,
//         },
//         recommended_price: inspection.recommended_price,
//         partner_notes: inspection.notes,
//       });
//       toast.success('Inspection submitted');
//       onSubmitSuccess();
//     } catch (error) {
//       toast.error('Failed to submit inspection');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Device Inspection</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Body Condition</label>
//           <select value={inspection.body} onChange={(e) => setInspection({ ...inspection, body: e.target.value })} className="w-full p-3 border rounded-lg">
//             <option value="flawless">Flawless</option>
//             <option value="good">Good</option>
//             <option value="average">Average</option>
//             <option value="below_average">Below Average</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Screen Condition</label>
//           <select value={inspection.screen} onChange={(e) => setInspection({ ...inspection, screen: e.target.value })} className="w-full p-3 border rounded-lg">
//             <option value="flawless">Flawless</option>
//             <option value="minor_scratches">Minor Scratches</option>
//             <option value="major_scratches">Major Scratches</option>
//             <option value="broken">Broken</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Battery Health (%)</label>
//           <input type="number" value={inspection.battery_health} onChange={(e) => setInspection({ ...inspection, battery_health: parseInt(e.target.value) })} className="w-full p-3 border rounded-lg" min="0" max="100" />
//         </div>
//         <div className="flex items-center gap-2">
//           <input type="checkbox" checked={inspection.imei_verified} onChange={(e) => setInspection({ ...inspection, imei_verified: e.target.checked })} id="imei" />
//           <label htmlFor="imei">IMEI Verified</label>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Recommended Price (₹)</label>
//           <input type="number" value={inspection.recommended_price} onChange={(e) => setInspection({ ...inspection, recommended_price: parseFloat(e.target.value) })} className="w-full p-3 border rounded-lg" required />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Notes</label>
//           <textarea value={inspection.notes} onChange={(e) => setInspection({ ...inspection, notes: e.target.value })} className="w-full p-3 border rounded-lg" rows={3} />
//         </div>
//         <ImageUploader onImagesChange={setImages} maxImages={5} />
//         <Button type="submit" loading={submitting} variant="primary" size="lg" className="w-full">
//           Submit Inspection
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default DeviceInspection;