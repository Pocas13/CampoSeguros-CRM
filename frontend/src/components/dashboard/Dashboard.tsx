import { KPICard } from "@/components/dashboard/KPICard";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";

const kpis = [
  { title: "Clientes", value: "482", description: "+12% este mês" },
  { title: "Apólices", value: "1.245", description: "+8% este mês" },
  { title: "Renovações", value: "26", description: "4 pendentes" },
  { title: "Sinistros", value: "3", description: "1 em análise" },
];

export function Dashboard() {
  return (
    <div className="p-10">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <KPICard key={item.title} title={item.title} value={item.value} description={item.description} />
        ))}
      </div>

      <WelcomeCard />
    </div>
  );
}
