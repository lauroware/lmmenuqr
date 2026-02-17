import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMenu } from '../api';

import PublicMenuGrid from './templates/PublicMenuGrid';
import PublicMenuList from './templates/PublicMenuList';
import PublicMenuAccordion from './templates/PublicMenuAccordion';
import PublicMenuUltraElegant from './templates/PublicMenuClassic';
import PublicMenuClassic from './templates/PublicMenuMinimalista';
import PublicMenuCafeTypewriter from './templates/PublicMenuCafe';
import PublicMenuCafeRelax from './templates/PublicMenuRelax';
import PublicMenuVisual from './templates/PublicMenuFotoFirst';

const PublicMenu = () => {
  const { uniqueId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const menuData = await getPublicMenu(uniqueId);
        setData(menuData);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Menú no encontrado.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  // ✅ Esto va ANTES del layout
  if (data?.unavailable) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Sitio no disponible</h1>
          <p className="text-gray-600">Por favor contactá al comercio.</p>
        </div>
      </div>
    );
  }

  const layout = data?.theme?.layout || 'grid';

  if (layout === 'accordion') return <PublicMenuAccordion data={data} />;
  if (layout === 'list') return <PublicMenuList data={data} />;
  if (layout === 'classic') return <PublicMenuClassic data={data} />;
  if (layout === 'ultra-elegant') return <PublicMenuUltraElegant data={data} />;
  if (layout === 'cafe-typewriter') return <PublicMenuCafeTypewriter data={data} />;
  if (layout === 'cafe-relax') return <PublicMenuCafeRelax data={data} />;
  if (layout === 'visual') return <PublicMenuVisual data={data} />;

  return <PublicMenuGrid data={data} />;
};

export default PublicMenu;
