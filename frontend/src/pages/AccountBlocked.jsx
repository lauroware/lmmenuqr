import React from 'react';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'hola@menuqr.com';
const PRICE         = import.meta.env.VITE_MEMBERSHIP_PRICE || '15.000';

/**
 * Se muestra cuando alguien escanea el QR de un comercio con membresía vencida.
 * También se usa dentro del dashboard cuando la cuenta está bloqueada.
 */

//lauro 


const AccountBlocked = ({ isOwner = false }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">

        {/* Ícono */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        {isOwner ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu cuenta está inactiva</h1>
            <p className="text-gray-500 mb-6">
              Tu período de prueba o membresía venció. Tu menú QR no está disponible para tus clientes.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-800 mb-1">Para reactivar tu cuenta:</p>
              <p className="text-sm text-blue-700">
                1. Transferí <strong>${PRICE} ARS</strong> según las instrucciones que te enviamos.<br />
                2. Enviá el comprobante a <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-medium">{CONTACT_EMAIL}</a><br />
                3. Activamos tu membresía en menos de 24hs hábiles.
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Renovación membresía MenuQR`}
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Contactar para renovar
            </a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Menú no disponible</h1>
            <p className="text-gray-500 mb-6">
              Este menú no está disponible temporalmente. Por favor volvé a intentarlo más tarde.
            </p>
            <p className="text-sm text-gray-400">
              Si sos el dueño del comercio, contactate con el soporte de MenuQR.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountBlocked;
