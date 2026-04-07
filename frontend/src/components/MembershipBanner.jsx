import React from 'react';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'hola@menuqr.com';
const PRICE         = import.meta.env.VITE_MEMBERSHIP_PRICE || '15.000';

/**
 * Banner de membresía para mostrar en el dashboard del admin.
 * Props: membershipStatus, trialDaysLeft, membershipPaidUntil
 */

//lauro 


const MembershipBanner = ({ membershipStatus, trialDaysLeft, membershipPaidUntil }) => {
  if (membershipStatus === 'active') {
    const until = membershipPaidUntil
      ? new Date(membershipPaidUntil).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : null;

    // Solo mostrar si vence en menos de 10 días
    const daysLeft = membershipPaidUntil
      ? Math.ceil((new Date(membershipPaidUntil) - new Date()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysLeft > 10) return null;

    return (
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-yellow-500 text-xl mt-0.5">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-800">Tu membresía vence el {until}</p>
          <p className="text-sm text-yellow-700 mt-0.5">
            Quedan <strong>{daysLeft} días</strong>. Contactanos para renovar antes de que tu menú se desactive.
          </p>
        </div>
        <a href={`mailto:${CONTACT_EMAIL}?subject=Renovación membresía MenuQR`}
          className="shrink-0 text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          Renovar
        </a>
      </div>
    );
  }

  if (membershipStatus === 'trial') {
    const color = trialDaysLeft <= 7 ? 'orange' : 'blue';
    const colors = {
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-800', body: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600' },
      blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   title: 'text-blue-800',   body: 'text-blue-700',   btn: 'bg-blue-500 hover:bg-blue-600' },
    }[color];

    return (
      <div className={`mb-6 ${colors.bg} border ${colors.border} rounded-xl p-4 flex items-start gap-3`}>
        <span className="text-xl mt-0.5">{trialDaysLeft <= 7 ? '⚠️' : '🕐'}</span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${colors.title}`}>
            Período de prueba gratuita — {trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''} restante{trialDaysLeft !== 1 ? 's' : ''}
          </p>
          <p className={`text-sm ${colors.body} mt-0.5`}>
            Al vencer, tu menú QR dejará de estar disponible para tus clientes.
            La membresía mensual es <strong>${PRICE} ARS</strong>.
          </p>
        </div>
        <a href={`mailto:${CONTACT_EMAIL}?subject=Quiero activar mi membresía MenuQR`}
          className={`shrink-0 text-xs font-semibold ${colors.btn} text-white px-3 py-1.5 rounded-lg transition-colors`}>
          Activar membresía
        </a>
      </div>
    );
  }

  if (membershipStatus === 'expired' || membershipStatus === 'blocked') {
    return (
      <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
        <span className="text-red-500 text-xl mt-0.5">🔴</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">Tu cuenta está inactiva</p>
          <p className="text-sm text-red-700 mt-0.5">
            Tu menú QR no está disponible para tus clientes.
            Contactanos para reactivar tu membresía (<strong>${PRICE} ARS/mes</strong>).
          </p>
        </div>
        <a href={`mailto:${CONTACT_EMAIL}?subject=Reactivar cuenta MenuQR`}
          className="shrink-0 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors">
          Reactivar
        </a>
      </div>
    );
  }

  return null;
};

export default MembershipBanner;
