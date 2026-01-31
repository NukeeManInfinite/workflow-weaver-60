/**
 * Category Resolution Utility
 * Handles multiple backend response formats for order categories
 */

export interface CategoryInfo {
  id: number;
  name: string;
  description?: string;
}

export interface OrderWithCategories {
  id?: number | string;
  orderNumber?: string;
  categories?: CategoryInfo[];
  orderCategories?: Array<{
    id?: number;
    orderId?: number;
    categoryId: number;
    categoryName?: string;
    category?: { id?: number; name: string; description?: string };
  }>;
  categoryNames?: string[] | string;
  categoryIds?: number[];
  categoryName?: string;
  categoryId?: number | string;
  contract?: {
    id?: number;
    categoryIds?: string | number[];
  };
}

/**
 * Resolves category names from an order object.
 * Handles multiple backend response formats with priority:
 * 1. order.categories[].name
 * 2. order.orderCategories[].category.name
 * 3. order.categoryNames[] (array or string)
 * 4. order.contract.categoryIds → mapped via categoriesMap
 * 5. order.categoryIds → mapped via categoriesMap
 * 
 * @param order - Order object with potential category data
 * @param categoriesMap - Map of categoryId → categoryName for ID resolution
 * @returns Comma-separated category names or "Kategoriya belgilanmagan"
 */
export function getOrderCategoryNames(
  order: OrderWithCategories,
  categoriesMap?: Map<number, string>
): string {
  const FALLBACK = 'Kategoriya belgilanmagan';
  
  if (!order) return FALLBACK;

  // Priority 1: order.categories [{ id, name }]
  if (order.categories && Array.isArray(order.categories) && order.categories.length > 0) {
    const names = order.categories
      .map(cat => cat?.name)
      .filter((name): name is string => Boolean(name && name.trim()));
    
    if (names.length > 0) {
      return names.join(', ');
    }
  }

  // Priority 2: order.orderCategories [{ categoryId, category: { name } }] or [{ categoryId, categoryName }]
  if (order.orderCategories && Array.isArray(order.orderCategories) && order.orderCategories.length > 0) {
    // Try to get names from category object first, then from categoryName field
    const names = order.orderCategories
      .map(oc => oc?.category?.name || oc?.categoryName)
      .filter((name): name is string => Boolean(name && name.trim()));
    
    if (names.length > 0) {
      return names.join(', ');
    }
    
    // If no names found but have categoryIds, try to resolve via map
    if (categoriesMap && categoriesMap.size > 0) {
      const resolvedNames = order.orderCategories
        .map(oc => categoriesMap.get(oc.categoryId))
        .filter((name): name is string => Boolean(name));
      
      if (resolvedNames.length > 0) {
        return resolvedNames.join(', ');
      }
    }
  }

  // Priority 3: order.categoryNames (array or string)
  if (order.categoryNames) {
    if (Array.isArray(order.categoryNames) && order.categoryNames.length > 0) {
      const names = order.categoryNames.filter(name => Boolean(name && name.trim()));
      if (names.length > 0) {
        return names.join(', ');
      }
    } else if (typeof order.categoryNames === 'string' && order.categoryNames.trim()) {
      return order.categoryNames.trim();
    }
  }

  // Priority 4: order.contract.categoryIds → resolve via map
  if (order.contract?.categoryIds && categoriesMap && categoriesMap.size > 0) {
    let ids: number[] = [];
    
    if (typeof order.contract.categoryIds === 'string') {
      ids = order.contract.categoryIds
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
    } else if (Array.isArray(order.contract.categoryIds)) {
      ids = order.contract.categoryIds.filter(n => typeof n === 'number');
    }

    if (ids.length > 0) {
      const names = ids
        .map(id => categoriesMap.get(id))
        .filter((name): name is string => Boolean(name));
      
      if (names.length > 0) {
        return names.join(', ');
      }
      
      // Warn if IDs exist but couldn't be resolved
      console.warn(
        `Order ${order.id || order.orderNumber}: Could not resolve category names from contract.categoryIds:`,
        order.contract.categoryIds
      );
    }
  }

  // Priority 5: order.categoryIds → resolve via map
  if (order.categoryIds && Array.isArray(order.categoryIds) && order.categoryIds.length > 0) {
    if (categoriesMap && categoriesMap.size > 0) {
      const names = order.categoryIds
        .map(id => categoriesMap.get(id))
        .filter((name): name is string => Boolean(name));
      
      if (names.length > 0) {
        return names.join(', ');
      }
      
      // Warn if IDs exist but couldn't be resolved
      console.warn(
        `Order ${order.id || order.orderNumber}: Could not resolve category names from categoryIds:`,
        order.categoryIds
      );
    } else {
      console.warn(
        `Order ${order.id || order.orderNumber}: Has categoryIds but no categoriesMap provided:`,
        order.categoryIds
      );
    }
  }

  // Priority 6 (legacy): Single categoryName field
  if (order.categoryName && order.categoryName.trim()) {
    return order.categoryName.trim();
  }

  // Priority 7: Single categoryId field - resolve via map
  if (order.categoryId && categoriesMap && categoriesMap.size > 0) {
    const numId = typeof order.categoryId === 'string' ? parseInt(order.categoryId, 10) : order.categoryId;
    if (!isNaN(numId)) {
      const name = categoriesMap.get(numId);
      if (name) {
        return name;
      }
      console.warn(
        `Order ${order.id || order.orderNumber}: Could not resolve category name from categoryId:`,
        order.categoryId
      );
    }
  }

  // All checks failed - truly no categories
  return FALLBACK;
}

/**
 * Creates a Map<number, string> from an array of categories
 * Supports both numeric and string IDs
 */
export function createCategoriesMap(categories: Array<{ id: number | string; name: string }>): Map<number, string> {
  const map = new Map<number, string>();
  
  if (!Array.isArray(categories)) return map;
  
  categories.forEach(cat => {
    if (cat?.id && cat?.name) {
      const numId = typeof cat.id === 'string' ? parseInt(cat.id, 10) : cat.id;
      if (!isNaN(numId)) {
        map.set(numId, cat.name);
      }
    }
  });
  
  return map;
}

/**
 * Checks if an order has any category data
 */
export function hasCategories(order: OrderWithCategories): boolean {
  return getOrderCategoryNames(order) !== 'Kategoriya belgilanmagan';
}
