import useAppStore from '@/stores/app';

export default function DesktopContent(props: any) {
  const {
    installedApps: apps,
    openedApps,
    openApp,
    updateAppOrder,
    updateAppsMousedown
  } = useAppStore((state) => state);
}
