import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMenu } from '../api';

import PublicMenuGrid from './templates/PublicMenuGrid';
import PublicMenuList from './templates/PublicMenuList';
import PublicMenuAccordion from './templates/PublicMenuAccordion';
import PublicMenuClassic from './templates/PublicMenuClassic';


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
        setError('Menu not found or currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [uniqueId]);

  const layout = data?.theme?.layout || 'grid';

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>;

  if (layout === 'accordion') return <PublicMenuAccordion data={data} />;
  if (layout === 'list') return <PublicMenuList data={data} />;
  if (layout === 'classic') return <PublicMenuClassic data={data} />;
  return <PublicMenuGrid data={data} />;
};

export default PublicMenu;
