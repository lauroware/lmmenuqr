import React, { useMemo } from "react";

const MenuPoster = ({ restaurantName, items, primaryColor = "#2563eb" }) => {
  const categories = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!it?.category) continue;
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category).push(it);
    }
    return Array.from(map.entries()); // [ [cat, items[]], ... ]
  }, [items]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* “Hoja” */}
      <div className="bg-[#f2e4c9] border-[14px] border-[#b85a4b] rounded-[28px] p-6 sm:p-10 shadow-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-wide"
            style={{ color: primaryColor }}
          >
            {restaurantName}
          </h1>
          <p className="text-sm text-gray-700 mt-2">
            Carta / Menú
          </p>
        </div>

        {/* Grilla tipo “carta” */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(([category, catItems]) => (
            <section key={category} className="bg-[#f6ead6] border border-[#c27a6c] rounded-2xl p-4 sm:p-5">
              <h2
                className="text-xl font-extrabold mb-3"
                style={{ color: primaryColor }}
              >
                {category}
              </h2>

              <div className="space-y-3">
                {catItems.map((item) => (
                  <div
                    key={item._id}
                    className={`${!item.available ? "opacity-50" : ""}`}
                  >
                    {/* fila nombre .... precio */}
                    <div className="flex items-baseline gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3">
                          <span className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </span>

                          {/* leader dots */}
                          <span className="flex-1 border-b border-dotted border-gray-500 translate-y-[-2px]" />
                        </div>

                        {item.description && (
                          <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* tags / anotaciones */}
                        {(item.tags?.length > 0 || item.notes) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.tags?.slice(0, 3).map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-full border border-gray-300 bg-white/50 text-gray-700"
                              >
                                {t}
                              </span>
                            ))}
                            {item.notes && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-300 bg-white/50 text-gray-700">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 font-extrabold text-gray-900">
                        ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                      </div>
                    </div>

                    {!item.available && (
                      <p className="text-[11px] text-red-700 font-semibold mt-1">
                        No disponible
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer “decorativo” opcional */}
        <div className="mt-8 text-center text-xs text-gray-700">
          ¡Gracias por tu visita!
        </div>
      </div>
    </div>
  );
};

export default MenuPoster;
