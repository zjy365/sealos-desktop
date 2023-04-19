import request from '@/services/request';
import { TOSState, TApp, initialFrantState, APPTYPE } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const storageOrderKey = 'app-orders';

const useAppStore = create<TOSState>()(
  devtools(
    persist(
      immer<TOSState>((set, get) => ({
        installedApps: [],
        orderApps: {},
        openedApps: [],
        pinnedApps: [],
        currentApp: undefined,
        maxZIndex: 0,
        isHideStartMenu: true,
        allApps: [],

        init: async () => {
          const res = await request('/api/desktop/getInstalledApps');
          console.log(res);

          set((state) => {
            /* equal order. just save first item */
            const map: { [key: string]: string } = Object.entries(get().orderApps).reduce(
              (acc: any, [key, value]) => {
                acc[value] = key;
                return acc;
              },
              {}
            );
            state.orderApps = Object.entries(map).reduce((acc: any, [key, value]) => {
              acc[value] = +key;
              return acc;
            }, {});
          });

          set((state) => {
            state.installedApps = res?.data?.map((item: TApp, i: number) => {
              return {
                ...item,
                ...initialFrantState,
                // @ts-ignore nextline
                order: state.getAppOrder(item)
              };
            });
            state.maxZIndex = 0;
          });
        },

        closeApp: (name: string) => {
          set((state) => {
            state.openedApps = state.openedApps.filter((app) => app.name !== name);
          });
        },

        installApp: (app: TApp) => {
          set((state) => {
            state.installedApps = [
              ...state.installedApps,
              {
                ...app,
                ...initialFrantState,
                // @ts-ignore nextline
                order: state.getAppOrder(app)
              }
            ];
          });
        },

        getAllApps: async () => {
          const res = await request('/api/desktop/getInstalledApps');

          set((state) => {
            state.allApps = res?.data || [];
          });
          return res;
        },

        updateOpenedAppInfo: (app: TApp) => {
          set((state) => {
            state.openedApps = state.openedApps.map((_app) => {
              _app.mask = true;
              return _app.name === app.name ? app : _app;
            });

            const activeApps = state.openedApps.filter((item) => item.size !== 'minimize');
            activeApps.sort((a, b) => b.zIndex - a.zIndex);
            state.currentApp = activeApps[0];
          });
        },

        /**
         * get install app order value.
         */
        getAppOrder: (app: TApp) => {
          let order = get().orderApps[app.name];

          /* new app */
          if (typeof order !== 'number') {
            const orders = Object.values(get().orderApps);
            orders.sort((a, b) => a - b);

            for (let i = 0; i < orders.length; i++) {
              if (i === orders.length - 1 || orders[i] + 1 !== orders[i + 1]) {
                order = orders[i] + 1;
                break;
              }
            }
          }

          /* first login, order is undefine */
          order = isNaN(order) ? 0 : order;

          set((state) => {
            const map = { ...state.orderApps };
            map[app.name] = order;
            state.orderApps = map;
          });
          return order;
        },

        updateAppOrder: (app: TApp, i: number) => {
          set((state) => {
            const newOrdersAppMap: { [key: string]: number } = {};

            state.installedApps = state.installedApps.map((_app) => {
              newOrdersAppMap[_app.name] = _app.name === app.name ? i : _app.order;
              return _app.name === app.name ? { ...app, order: i } : _app;
            });

            state.orderApps = newOrdersAppMap;
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
          const zIndex = (get().maxZIndex || 0) + 1;
          const _app: TApp = JSON.parse(JSON.stringify(app));
          if (_app.type === APPTYPE.LINK) {
            window.open(_app.data.url, '_blank');
            return;
          }
          _app.zIndex = zIndex;
          _app.isShow = true;
          _app.size = 'maximize';
          _app.mask = false;

          get().updateOpenedAppInfo(_app);

          set((state) => {
            if (!state.openedApps.find((item) => item.name === _app.name)) {
              state.openedApps.push(_app);
            }
            state.currentApp = _app;
            state.maxZIndex = zIndex;
          });
        },

        switchApp: (app: TApp, type) => {
          const zIndex = (get().maxZIndex || 0) + 1;
          const _app: TApp = JSON.parse(JSON.stringify(app));
          _app.zIndex = zIndex;
          _app.isShow = true;
          if (type !== 'clickMask') {
            if (get().currentApp?.name === _app.name) {
              _app.size === 'minimize' ? (_app.size = _app.cacheSize) : (_app.size = 'minimize');
            } else {
              _app.size = _app.cacheSize;
            }
          }

          get().updateOpenedAppInfo(_app);

          set((state) => {
            // repalce app info
            state.openedApps = state.openedApps.map((item) => {
              if (item.name === _app.name) {
                return _app;
              }
              return item;
            });

            state.currentApp = _app;
            state.maxZIndex = zIndex;
          });
        },

        toggleStartMenu: () => {
          set((state) => {
            state.isHideStartMenu = !state.isHideStartMenu;
          });
        }
      })),
      {
        name: storageOrderKey,
        partialize: (state) => ({
          orderApps: state.orderApps
        })
      }
    )
  )
);

export default useAppStore;
