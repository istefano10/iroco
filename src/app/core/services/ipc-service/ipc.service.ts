import { Injectable } from "@angular/core";
import { IpcRenderer} from "electron";

@Injectable({
  providedIn: "root"
})
export class IpcService {
  private ipc: IpcRenderer;
  constructor() {
    /*If window.require is available, it means that electron is running,
      then ipc will be loaded. */
    if (window.require) {
      // eslint-disable-next-line no-useless-catch
      try {
        this.ipc = window.require("electron").ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn("Electron IPC was not loaded");
    }
  }

  public on(channel: string, listener: any): void {
    if (!this.ipc) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.ipc.on(channel, listener);
  }

  public once(channel: string, listener: any): void {
    if (!this.ipc) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.ipc.once(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    if (!this.ipc) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.ipc.send(channel, ...args);
  }

  public removeAllListeners(channel: string): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.removeAllListeners(channel);
  }
}
