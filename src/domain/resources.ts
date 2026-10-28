import { ResourceItem, ResourceCategory, UsageMode, CharacterState } from './types';
import { resetAllSpellSlots } from './spells';

/**
 * Valida si una cadena es una URL con protocolo http o https.
 */
export function isValidHttpUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Descuenta 1 uso a un recurso de uso limitado individual (mínimo 0).
 * No altera recursos de modo ilimitado ni conjuros gestionados por slots globales.
 */
export function spendResource(resource: ResourceItem): ResourceItem {
  if (resource.usageMode === 'unlimited' || resource.availableUses === null) {
    return resource;
  }
  return {
    ...resource,
    availableUses: Math.max(0, resource.availableUses - 1),
  };
}

/**
 * Restaura 1 uso a un recurso de uso limitado individual (tope maxUses).
 * No altera recursos de modo ilimitado ni conjuros gestionados por slots globales.
 */
export function restoreResource(resource: ResourceItem): ResourceItem {
  if (resource.usageMode === 'unlimited' || resource.availableUses === null || resource.maxUses === null) {
    return resource;
  }
  return {
    ...resource,
    availableUses: Math.min(resource.maxUses, resource.availableUses + 1),
  };
}

export interface CreateResourceInput {
  name: string;
  category: ResourceCategory;
  usageMode: UsageMode;
  spellLevel?: number | null;
  url?: string;
  maxUses: number | null;
  description: string;
}

/**
 * Fabrica una nueva entidad ResourceItem aplicando las reglas e invariantes del modelo.
 */
export function createResource(input: CreateResourceInput, sortOrder: number): ResourceItem {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  let spellLevel: number | null = null;
  let usageMode = input.usageMode;
  let maxUses: number | null = null;

  if (input.category === 'spell') {
    const rawLevel = input.spellLevel !== undefined && input.spellLevel !== null ? input.spellLevel : 1;
    spellLevel = Math.max(0, Math.min(9, Math.floor(rawLevel)));
    if (spellLevel === 0) {
      usageMode = 'unlimited';
      maxUses = null;
    } else {
      usageMode = 'limited';
      // Los conjuros de nivel 1 a 9 no tienen maxUses individuales, usan spellSlots
      maxUses = null;
    }
  } else {
    spellLevel = null;
    if (usageMode === 'limited') {
      maxUses = Math.max(1, Math.floor(input.maxUses ?? 1));
    } else {
      maxUses = null;
    }
  }

  const cleanUrl = isValidHttpUrl(input.url) ? input.url!.trim().slice(0, 500) : undefined;

  return {
    id,
    name: input.name.trim().slice(0, 80),
    category: input.category,
    usageMode,
    spellLevel,
    url: cleanUrl,
    maxUses,
    availableUses: maxUses,
    description: input.description.slice(0, 4000),
    sortOrder,
  };
}

/**
 * Elimina un recurso de la colección por su identificador.
 */
export function deleteResource(resources: ResourceItem[], id: string): ResourceItem[] {
  return resources.filter((r) => r.id !== id);
}

/**
 * Retorna exclusivamente los rasgos y dotes con usos diarios limitados finitos.
 */
export function getLimitedTraits(resources: ResourceItem[]): ResourceItem[] {
  return resources.filter((r) => r.category === 'feat_trait' && r.usageMode === 'limited');
}

/**
 * Actualiza los usos máximos de un recurso limitado, ajustando los usos disponibles si exceden el nuevo tope.
 */
export function updateResourceMaxUses(resources: ResourceItem[], id: string, rawMax: number): ResourceItem[] {
  const cleanMax = Math.max(1, Math.floor(rawMax));
  return resources.map((r) => {
    if (r.id === id) {
      const currentAvailable = r.availableUses ?? cleanMax;
      const newAvailable = Math.min(cleanMax, currentAvailable);
      return {
        ...r,
        maxUses: cleanMax,
        availableUses: newAvailable,
      };
    }
    return r;
  });
}

/**
 * Actualiza tanto los usos disponibles como los máximos diarios de un rasgo limitado,
 * asegurando las invariantes: maxUses >= 1 y 0 <= availableUses <= maxUses.
 */
export function updateResourceUses(
  resources: ResourceItem[],
  id: string,
  rawAvailable: number,
  rawMax: number
): ResourceItem[] {
  const cleanMax = Math.max(1, Math.floor(rawMax));
  const cleanAvailable = Math.max(0, Math.min(cleanMax, Math.floor(rawAvailable)));

  return resources.map((r) => {
    if (r.id === id) {
      return {
        ...r,
        maxUses: cleanMax,
        availableUses: cleanAvailable,
      };
    }
    return r;
  });
}

/**
 * Parámetros para la actualización de los detalles descriptivos y de referencia de un recurso.
 */
export interface UpdateResourceDetailsInput {
  url?: string;
  description: string;
}

/**
 * Actualiza la URL y la descripción de un recurso existente, manteniendo intactos todos los demás campos.
 * Sanitiza la URL (solo http/https, máx 500 caracteres o undefined si está vacía) y la descripción (máx 4000 caracteres).
 */
export function updateResourceDetails(
  resources: ResourceItem[],
  id: string,
  details: UpdateResourceDetailsInput
): ResourceItem[] {
  const cleanUrl = isValidHttpUrl(details.url) ? details.url!.trim().slice(0, 500) : undefined;
  const cleanDescription = details.description.slice(0, 4000);

  return resources.map((r) => {
    if (r.id === id) {
      return {
        ...r,
        url: cleanUrl,
        description: cleanDescription,
      };
    }
    return r;
  });
}

/**
 * Aplica el Descanso Largo (Long Rest) restableciendo todos los recursos limitados a su valor máximo,
 * restaurando la vida actual al 100% de los PG máximos, reiniciando los PG temporales a 0
 * y recargando al 100% todos los espacios de conjuros de todos los niveles.
 */
export function applyLongRest(state: CharacterState): CharacterState {
  const updatedResources = state.resources.map((res) => {
    if (res.usageMode === 'limited' && res.maxUses !== null) {
      return {
        ...res,
        availableUses: res.maxUses,
      };
    }
    return res;
  });

  return {
    ...state,
    health: {
      ...state.health,
      currentHp: state.health.maxHp,
      tempHp: 0,
    },
    spellSlots: resetAllSpellSlots(state.spellSlots),
    resources: updatedResources,
    profile: {
      ...state.profile,
      updatedAt: new Date().toISOString(),
    },
  };
}
