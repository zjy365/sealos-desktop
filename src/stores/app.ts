import request from '@/services/request';
import { TOSState, TApp, initialFrantState, APPTYPE, Pid } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AppStateManager from '../utils/ProcessManager';
import { wait } from '@/utils/delay';
const storageOrderKey = 'app-orders';
// type AppInfo = TApp & { pid: Pid };
type AppController = Omit<
  TOSState,
  | 'allApps'
  | 'getAllApps'
  | 'pinnedApps'
  | 'orderApps'
  | 'openedApps'
  | 'getAppOrder'
  | 'updateAppOrder'
  | 'switchApp'
  | 'currentApp'
  | 'toggleStartMenu'
  | 'isHideStartMenu'
  | 'closeApp'
  | 'mask'
  | 'order'
> & {
  runner: AppStateManager;
  runningInfo: AppInfo[];
  currentAppPid: Pid;
  closeApp: (pid: Pid) => void;
  currentApp: () => AppInfo | undefined;
  switchApp: (pid: Pid) => void;
  findAppInfo: (pid: Pid) => AppInfo | undefined;
  setToHighestLayer: (pid: Pid) => void;
  updateOpenedAppInfo: (app: Tapp) => void;
};
type Tapp = Omit<TApp, 'mask' | 'order'> & { pid: Pid };
export class AppInfo {
  pid: number;
  isShow: boolean;
  zIndex: number;
  size: 'maximize' | 'maxmin' | 'minimize';
  cacheSize: 'maximize' | 'maxmin' | 'minimize';
  style: {};
  mouseDowning: boolean;
  key: string;
  name: string;
  icon: string;
  type: APPTYPE;
  data: {
    url: string;
    desc: string;
  };
  // app gallery
  gallery: string[];
  extra?: {};
  // app top info
  menuData?: {
    nameColor: string;
    helpDropDown: boolean;
    helpDocs: boolean | string;
  };
  constructor(app: TApp, pid: number) {
    this.isShow = false;
    this.zIndex = 1;
    this.size = 'maximize';
    this.cacheSize = 'maximize';
    this.style = structuredClone(app.style);
    this.mouseDowning = false;
    this.menuData = structuredClone(app.menuData);
    this.gallery = structuredClone(app.gallery);
    this.extra = structuredClone(app.extra);
    this.data = structuredClone(app.data);
    this.type = app.type;
    this.icon = app.icon;
    this.name = app.name;
    this.key = app.key;
    this.pid = pid;
  }
}
const useAppStore = create<AppController>()(
  devtools(
    persist(
      immer<AppController>((set, get) => ({
        installedApps: [],
        runningInfo: [],
        // present of highest layer
        currentAppPid: -1,
        maxZIndex: 0,

        runner: new AppStateManager([]),
        init: async () => {
          const res = await request('/api/desktop/getInstalledApps');
          console.log(res);
          set((state) => {
            state.installedApps = res?.data?.map((app: TApp) => new AppInfo(app, -1));
            state.runner.loadApps(state.installedApps.map((app) => app.key));
            state.maxZIndex = 0;
          });
        },
        // should use pid to close app, but it don't support multi same app process now
        closeApp: (pid: Pid) => {
          set((state) => {
            state.runner.closeApp(pid);
            // make sure the process is killed
            console.assert(!get().runner.findState(pid), 'error: process is not killed');
            state.runningInfo = state.runningInfo.filter((item) => item.pid !== pid);
          });
        },

        installApp: (app: Tapp) => {
          set((state) => {
            state.installedApps.push(new AppInfo(app, -1));
            state.runner.loadApp(app.key);
          });
        },
        findAppInfo: (pid: Pid) => {
          // make sure the process is running
          console.assert(!!get().runner.findState(pid));
          return get().runningInfo.find((item) => item.pid === pid);
        },
        updateOpenedAppInfo: (app: AppInfo) => {
          set((state) => {
            state.runningInfo = state.runningInfo.map((_app) => {
              if (_app.pid === app.pid) {
                return app;
              } else {
                return _app;
              }
            });
          });
        },

        /**
         * update apps mousedown enum. app set to status, other apps set to false
         */
        updateAppsMousedown(app: TApp, status: boolean) {
          set((state) => {
            state.installedApps = state.installedApps.map((_app) => {
              return _app.name === app.name
                ? { ...app, mouseDowning: status }
                : { ..._app, mouseDowning: false };
            });
          });
        },

        openApp: async (app: TApp) => {
          const zIndex = get().maxZIndex + 1;
          // debugger
          // 未支持多实例
          let allreadyApp = get().runningInfo.find((x) => x.key === app.key);
          if (allreadyApp) {
            get().switchApp(allreadyApp.pid);
            return;
          }
          if (app.type === APPTYPE.LINK) {
            window.open(app.data.url, '_blank');
            return;
          }
          let run_app = get().runner.openApp(app.key);
          const _app = new AppInfo(app, run_app.pid);
          _app.zIndex = zIndex;
          _app.size = 'maximize';
          _app.isShow = true;

          // get().updateOpenedAppInfo(_app);

          set((state) => {
            state.runningInfo.push(_app);
            state.currentAppPid = _app.pid;
            state.maxZIndex = zIndex;
          });
        },
        // maximize app
        switchApp: (pid: Pid) => {
          // const zIndex = get().maxZIndex + 1;
          console.log('switchApp');
          set((state) => {
            let _app = state.runningInfo.find((item) => item.pid === pid);
            if (!_app) return;
            _app.isShow = true;
            _app.size = _app.cacheSize;
            state.setToHighestLayer(pid);
          });
        },
        // get switch floor function
        setToHighestLayer: (pid: Pid) => {
          const zIndex = get().maxZIndex + 1;
          console.log(zIndex);
          set((state) => {
            let _app = state.runningInfo.find((item) => item.pid === pid)!;
            console.assert(!!_app, 'error: app is not running');

            _app.zIndex = zIndex;
            get().updateOpenedAppInfo(_app);

            state.currentAppPid = pid;
            state.maxZIndex = zIndex;
          });
        },
        currentApp: () => get().findAppInfo(get().currentAppPid)
      })),
      {
        name: 'app-runner',
        partialize: (state) => ({
          // runner: state.runner
        })
      }
    )
  )
);

export default useAppStore;
