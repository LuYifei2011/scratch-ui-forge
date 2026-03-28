import type { ScratchComponentDef } from './types';

class ComponentRegistryImpl {
  private components = new Map<string, ScratchComponentDef>();

  register(def: ScratchComponentDef): void {
    this.components.set(def.id, def);
  }

  get(id: string): ScratchComponentDef | undefined {
    return this.components.get(id);
  }

  list(): ScratchComponentDef[] {
    return Array.from(this.components.values());
  }

  getByCategory(category: string): ScratchComponentDef[] {
    return this.list().filter((c) => c.category === category);
  }

  getCategories(): string[] {
    const cats = new Set(this.list().map((c) => c.category));
    return Array.from(cats);
  }
}

export const ComponentRegistry = new ComponentRegistryImpl();
