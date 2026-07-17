import { KPICard } from "./KPICard";
import { WelcomeCard } from "./WelcomeCard";

const kpis = [
  { title: "Clientes", value: "482", description: "+12 este mês" },
  { title: "Apólices", value: "1245", description: "+18 este mês" },
  { title: "Renovações", value: "26", description: "Hoje" },
  { title: "Sinistros", value: "3", description: "Em análise" },
];

export default function Dashboard() {
  return (
    <div>

      <h1 className="mb-8 text-3xl font-bold">

        Dashboard

      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {kpis.map((item) => (

          <KPICard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
          />

        ))}

      </div>

      <WelcomeCard />

    </div>
  );
}