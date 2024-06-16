import { assert, requires } from '~/util/general/contracts';
import type WorldRenderModule from './worldRenderModule'
import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';

export default class WorldModuleManager {
  private modules: WorldRenderModule[];

  constructor(modules: WorldRenderModule[] | null = null) {
    if (modules != null) this.modules = modules.sort((a, b) => a.getZIndex() - b.getZIndex());
    else this.modules = [];

    assert(this.modulesAreSorted());
  }

  addModule(module: WorldRenderModule) {
    requires(this.modulesAreSorted());

    for (let i = 0; i < this.modules.length; i++) {
      const curr = this.modules[i];
      if (module.getZIndex() <= curr.getZIndex()) {
        this.modules.splice(i, 0, module);
        return;
      }
    }

    this.modules.push(module);
  }

  render(canvasFramebuffer: FrameBuffer) {
    requires(this.modulesAreSorted());

    for (const mod of this.modules) mod.render(canvasFramebuffer);
  }

  private modulesAreSorted(): boolean {
    for (let i = 0; i < this.modules.length - 1; i++) {
      const before = this.modules[i];
      const after = this.modules[i + 1];
      if (before.getZIndex() > after.getZIndex()) return false;
    }

    return true;
  }
}
