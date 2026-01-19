import React, { useState } from 'react';

const CreateMenuForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating menu:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu menú digital</h2>
        <p className="text-gray-600">
          Configura tu menú digital para empezar a mostrarlo a tus clientes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">Nombre del restaurante *</label>
          <input
            id="restaurantName"
            name="restaurantName"
            type="text"
            value={formData.restaurantName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${errors.restaurantName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            placeholder="Ingresa el nombre de tu restaurante"
          />
          {errors.restaurantName && <p className="text-sm text-red-600 mt-1">{errors.restaurantName}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descripción del menú *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            placeholder="Describe tu restaurante y tu menú."
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• A tu menú digital se le asociará un unico QR</li>
            <li>• Una vez que tengas tu código QR podrás imprimirlo y pegarlo en las mesas.</li>
            <li>• Empieza a agregar items al menú</li>
            <li>• Tus clientes pueden escanear el QR y ver tu menú</li>
            <li>• Recuerda que a través de Latinmerch (www.latinmerch.com.ar), puedes solicitarnos porta qr en varios formatos, te entregamos todo listo para que empieces a usarlo</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
              Guardar Menú
            </div>
          ) : (
            'Menú digital creado'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateMenuForm;
