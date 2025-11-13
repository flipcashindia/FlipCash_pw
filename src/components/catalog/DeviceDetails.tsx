import React from 'react';
import { type DeviceModelDetail } from '../../types/catalog.types';
import { formatCurrency } from '../../utils/formatters';

interface DeviceDetailsProps {
  device: DeviceModelDetail;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row gap-6">
        {device.image_url && <img src={device.image_url} alt={device.name} className="w-full md:w-1/3 h-64 object-contain" />}
        <div className="flex-1">
          <p className="text-sm text-gray-600">{device.brand_name}</p>
          <h1 className="text-3xl font-bold mb-2">{device.name}</h1>
          <p className="text-2xl text-teal-600 font-bold mb-4">{formatCurrency(device.base_price)}</p>
          <div className="space-y-2">
            {device.storage_options && <div><span className="font-semibold">Storage:</span> {device.storage_options.join(', ')}</div>}
            {device.ram_options && <div><span className="font-semibold">RAM:</span> {device.ram_options.join(', ')}</div>}
            {device.color_options && <div><span className="font-semibold">Colors:</span> {device.color_options.join(', ')}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;