import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMenu } from '../api';

// ✅ Solo accordion
import PublicMenuAccordion from './templates/PublicMenuAccordion';

const PublicMenuDelivery = () => {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>;

  // ✅ Siempre Accordion, sin layout switch
  return <PublicMenuAccordion data={data} mode="delivery" />;
};

export default PublicMenuDelivery;