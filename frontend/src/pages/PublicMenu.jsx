import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMenu } from '../api';
import AccountBlocked from './AccountBlocked';

import PublicMenuGrid         from './templates/PublicMenuGrid';
import PublicMenuList         from './templates/PublicMenuList';
import PublicMenuAccordion    from './templates/PublicMenuAccordion';
import PublicMenuUltraElegant from './templates/PublicMenuClassic';
import PublicMenuClassic      from './templates/PublicMenuMinimalista';
import PublicMenuCafeTypewriter from './templates/PublicMenuCafe';
import PublicMenuCafeRelax    from './templates/PublicMenuRelax';
import PublicMenuVisual       from './templates/PublicMenuFotoFirst';

const PublicMenu = () => {
  const { uniqueId } = useParams();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [membershipExpired, setMembershipExpired] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        setMembershipExpired(false);
        const menuData = await getPublicMenu(uniqueId);
        setData(menuData);
      } catch (err) {
        // El backend devuelve membershipExpired: true cuando la cuenta venció
        if (err.response?.data?.membershipExpired) {
          setMembershipExpired(true);
        } else {
          setError('Menú no encontrado.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
      </div>
    );
  }

  // Membresía vencida — mostramos página amigable
  if (membershipExpired) {
    return <AccountBlocked isOwner={false} />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 mb-2">Menú no encontrado</p>
          <p className="text-gray-400">El enlace puede ser incorrecto o el menú fue eliminado.</p>
        </div>
      </div>
    );
  }

  const template = data?.menu?.theme?.template || 'accordion';

  const templates = {
    grid:        PublicMenuGrid,
    list:        PublicMenuList,
    accordion:   PublicMenuAccordion,
    ultraElegant: PublicMenuUltraElegant,
    classic:     PublicMenuClassic,
    cafe:        PublicMenuCafeTypewriter,
    relax:       PublicMenuCafeRelax,
    visual:      PublicMenuVisual,
  };

  const TemplateComponent = templates[template] || PublicMenuAccordion;
  return <TemplateComponent data={data} />;
};

export default PublicMenu;
