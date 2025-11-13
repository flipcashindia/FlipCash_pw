import React from 'react';
import { type DeviceModel } from '../../types/catalog.types';
import { formatCurrency } from '../../utils/formatters';

interface ModelSelectorProps {
  models: DeviceModel[];
  onModelSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, onModelSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model) => (
        <button key={model.id} onClick={() => onModelSelect(model.id)} className="text-left bg-white p-4 rounded-xl shadow border hover:shadow-lg transition">
          {model.image_url && <img src={model.image_url} alt={model.name} className="w-full h-40 object-contain mb-3" />}
          <h3 className="font-semibold text-lg mb-1">{model.name}</h3>
          <p className="text-teal-600 font-bold">{formatCurrency(model.base_price)}</p>
        </button>
      ))}
    </div>
  );
};

export default ModelSelector;