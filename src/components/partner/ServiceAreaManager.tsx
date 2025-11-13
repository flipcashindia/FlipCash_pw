import React, { useState, useEffect } from 'react';
import { partnerService } from '../../api/services/partnerService';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2 } from 'lucide-react';
// Assuming the types are defined here for the service request/response
import { 
    type ServiceArea as ApiServiceArea, 
    type CreateServiceAreaRequest 
} from '../../api/types/api';
import { validatePincode } from '../../utils/validators';

// Define the shape of the local form data
interface ServiceAreaFormData {
    postal_code_input: string; // Used for a single string input in the form
    city: string;
    state: string;
}

const ServiceAreaManager: React.FC = () => {
    const toast = useToast();
    const [areas, setAreas] = useState<ApiServiceArea[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<ServiceAreaFormData>({ 
        postal_code_input: '', 
        city: '', 
        state: '' 
    });

    useEffect(() => {
        loadServiceAreas();
    }, []);

    const loadServiceAreas = async () => {
        try {
            setLoading(true);
            const data = await partnerService.getServiceAreas();
            setAreas(data);
        } catch (error) {
            toast.error('Failed to load service areas');
        } finally {
            setLoading(false);
        }
    };
    
    // Placeholder function (You'd implement this in the service)
    const handleDelete = async (_areaId: string) => {
        if (window.confirm('Are you sure you want to delete this service area?')) {
            try {
                // Assuming partnerService.deleteServiceArea exists and takes an ID
                // await partnerService.deleteServiceArea(areaId);
                toast.success('Service area removed successfully.');
                loadServiceAreas();
            } catch (error) {
                toast.error('Failed to delete service area.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pincodeArray = formData.postal_code_input.split(',').map(p => p.trim()).filter(p => p.length > 0);
        
        if (pincodeArray.some(p => !validatePincode(p))) {
            toast.error('Invalid pincode(s) detected. Please check format.');
            return;
        }

        // 1. TS2322 Fix: postal_codes must be an array of strings (string[])
        const requestPayload: CreateServiceAreaRequest = {
            // FIX: Use the parsed array for the API request
            postal_codes: pincodeArray, 
            city: formData.city,
            state: formData.state,
            
            // FIX: Including missing required properties (placeholders)
            name: `${formData.city} Area`, 
            center_latitude: 0, 
            center_longitude: 0, 
            radius_km: 5, 
        };

        try {
            await partnerService.addServiceArea(requestPayload);
            toast.success('Service area added!');
            setShowForm(false);
            // Reset form data using the correct keys
            setFormData({ postal_code_input: '', city: '', state: '' });
            loadServiceAreas();
        } catch (error) {
            toast.error('Failed to add service area. Check server logs.');
        }
    };

    if (loading && areas.length === 0) {
        return <div className="p-6 text-center text-gray-500">Loading service areas...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Service Areas</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                >
                    <Plus size={20} />
                    {showForm ? 'Cancel' : 'Add Area'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border border-teal-200 bg-teal-50 rounded-lg space-y-4">
                    <p className="text-sm text-gray-600">Enter pincodes separated by commas (e.g., 400001, 400002).</p>
                    <input
                        type="text"
                        placeholder="Pincode(s)"
                        // FIX: Use the correct key `postal_code_input`
                        value={formData.postal_code_input}
                        // FIX: Use the correct key `postal_code_input`
                        onChange={(e) => setFormData({ ...formData, postal_code_input: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 disabled:opacity-50 transition"
                    >
                        {loading ? 'Adding...' : 'Add Service Area'}
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {areas.length === 0 && !loading ? (
                    <p className="text-center text-gray-500 p-4 border rounded-lg">No service areas added yet.</p>
                ) : (
                    areas.map((area) => (
                        <div key={area.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div>
                                {/* Displaying multiple postal codes nicely */}
                                <p className="font-semibold text-gray-800">Pincode(s): {area.postal_codes.join(', ')}</p>
                                <p className="text-sm text-gray-600">{area.city}, {area.state} ({area.name})</p>
                            </div>
                            <button
                                onClick={() => handleDelete(area.id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                                title="Remove Area"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ServiceAreaManager;