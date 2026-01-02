import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MAINTENANCE_TASKS } from "@/lib/constants";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function Home() {
  const carImage = PlaceHolderImages.find(img => img.id === 'mercedes-e-class');

  return (
    <DashboardClient 
      carImageUrl={carImage?.imageUrl ?? ''} 
      maintenanceTasks={MAINTENANCE_TASKS}
    />
  );
}
