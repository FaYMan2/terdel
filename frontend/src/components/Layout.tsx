import { Outlet } from "react-router";
import { NavigationMenu } from "./NavigationMenu";

export default function Layout() {
  return (
    <div className="flex w-screen">
      <NavigationMenu />
      <div className="flex-1">
        <Outlet /> {/* Render nested routes (App or TablePage) */}
      </div>
    </div>
  );
}
