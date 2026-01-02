import { PlaceHolderImages } from "@/lib/placeholder-images";
// import { MAINTENANCE_TASKS } from "@/lib/constants"; // No longer used
import DashboardClient from "@/components/dashboard/DashboardClient";
import { fetchMaintenanceTasks } from "@/actions/car-data";

export default async function Home() {
  const carImage = PlaceHolderImages.find(img => img.id === 'mercedes-e-class');
  const maintenanceTasks = await fetchMaintenanceTasks();

  return (
    <DashboardClient
      carImageUrl={carImage?.imageUrl ?? ''}
      maintenanceTasks={maintenanceTasks}
    />
  );
}
