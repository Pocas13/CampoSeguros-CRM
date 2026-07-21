import { PrismaClient, PaymentFrequency, PolicyStatus, UserRole, ContactType, OrganizationStatus, ClaimStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  let company = await prisma.company.findFirst({ orderBy: { id: "asc" } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "CampoSeguros",
        nif: "DEMO-CAMPOSEGUROS",
        email: "geral@camposeguros.pt",
        phone: "913895816",
        city: "Vila Nova de Gaia",
        website: "https://camposeguros.pt",
        slug: "camposeguros",
        status: OrganizationStatus.ACTIVE,
        plan: "PRO",
        maxUsers: 20,
        maxClients: 20000,
      },
    });
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        email: company.email || "geral@camposeguros.pt",
        phone: company.phone || "913895816",
        website: company.website || "https://camposeguros.pt",
        slug: company.slug || "camposeguros",
        status: OrganizationStatus.ACTIVE,
      },
    });
  }

  const testPassword = await bcrypt.hash("InsureFlow2026!", 10);
  await prisma.user.upsert({
    where: { email: "platform@insureflow.pt" },
    update: { companyId: null, active: true, role: UserRole.SUPER_ADMIN, permissions: ["*"] },
    create: { name: "Administração InsureFlow", email: "platform@insureflow.pt", password: testPassword, role: UserRole.SUPER_ADMIN, permissions: ["*"] },
  });
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@insureflow.pt" },
    update: { companyId: company.id, active: true, role: UserRole.ADMIN, permissions: [] },
    create: {
      name: "Administrador CampoSeguros",
      email: "admin@insureflow.pt",
      password: testPassword,
      role: UserRole.ADMIN,
      companyId: company.id,
      jobTitle: "Administrador",
      phone: "913895816",
    },
  });
  const employeeUser = await prisma.user.upsert({
    where: { email: "utilizador@insureflow.pt" },
    update: { companyId: company.id, active: true, role: UserRole.EMPLOYEE, permissions: [] },
    create: {
      name: "Utilizador de Teste",
      email: "utilizador@insureflow.pt",
      password: testPassword,
      role: UserRole.EMPLOYEE,
      companyId: company.id,
      jobTitle: "Gestor de clientes",
    },
  });

  const insurerSeed = [
    ["Fidelidade - Companhia de Seguros, S.A.", "Fidelidade", "https://www.fidelidade.pt"],
    ["Generali Seguros, S.A.", "Generali Tranquilidade", "https://www.generalitranquilidade.pt"],
    ["Allianz Portugal, S.A.", "Allianz", "https://www.allianz.pt"],
    ["Zurich Insurance Europe AG", "Zurich", "https://www.zurich.com.pt"],
    ["Ageas Portugal, Companhia de Seguros, S.A.", "Ageas", "https://www.ageas.pt"],
    ["Lusitania, Companhia de Seguros, S.A.", "Lusitania", "https://www.lusitania.pt"],
    ["Caravela - Companhia de Seguros, S.A.", "Caravela", "https://www.caravelaseguros.pt"],
    ["Una Seguros, S.A.", "UNA", "https://www.unaseguros.pt"],
  ] as const;

  const insurers: any[] = [];
  for (const [name, commercialName, website] of insurerSeed) {
    let insurer = await prisma.insurer.findFirst({ where: { commercialName } });
    if (!insurer) {
      insurer = await prisma.insurer.create({
        data: {
          name,
          commercialName,
          website,
          active: true,
          notes: "Dados gerais de demonstração. Atualize os contactos comerciais e linhas de apoio.",
        },
      });
    }
    insurers.push(insurer);
  }

  const generaliDirectory = insurers.find((item) => item.commercialName === "Generali Tranquilidade");
  if (generaliDirectory) {
    await prisma.insurer.update({
      where: { id: generaliDirectory.id },
      data: {
        agentPortalUrl: "https://webhubb2b.tranquilidade.pt",
        claimsPortalUrl: "https://www.generalitranquilidade.pt/sinistros",
        quoteLinks: {
          AUTO: "https://www.generalitranquilidade.pt/particulares/seguros/automovel/auto/simulador?p_encout=G31h2RkfVnty3ktAGbAlqk1UCCJ4WpxhageR%2BDxBqjQ%3D",
          HOME: "https://www.generalitranquilidade.pt/particulares/seguros/habitacao/casa/simular?p_encout=G31h2RkfVnty3ktAGbAlqk1UCCJ4WpxhageR%2BDxBqjQ%3D",
          LIFE: "https://www.generalitranquilidade.pt/particulares/seguros/vida/credito-de-casa/simulador?p_encout=G31h2RkfVnty3ktAGbAlqk1UCCJ4WpxhageR%2BDxBqjQ%3D"
        },
      },
    });
    const contactTemplates = [
      { type: ContactType.COMMERCIAL, department: "Comercial de apoio ao mediador", notes: "Preencher com o comercial responsável pela mediação." },
      { type: ContactType.SUPPORT, department: "Linha de apoio a agentes", notes: "Preencher telefone, email e horário da linha de agentes." },
      { type: ContactType.CLAIMS, department: "Apoio a sinistros", notes: "Preencher os contactos diretos de sinistros." },
    ];
    for (const contact of contactTemplates) {
      const exists = await prisma.insurerContact.findFirst({ where: { insurerId: generaliDirectory.id, type: contact.type, department: contact.department } });
      if (!exists) await prisma.insurerContact.create({ data: { insurerId: generaliDirectory.id, ...contact } });
    }
  }

  const demoClients = [
    {
      nif: "900000101",
      name: "Miguel Ferreira",
      email: "miguel.ferreira@demo.pt",
      phone: "910000101",
      city: "Porto",
      address: "Rua do Mercado, 101",
      postalCode: "4000-101",
      notes: "Cliente de demonstração para testes de automóvel.",
    },
    {
      nif: "900000102",
      name: "Ana Martins",
      email: "ana.martins@demo.pt",
      phone: "910000102",
      city: "Vila Nova de Gaia",
      address: "Avenida do Douro, 22",
      postalCode: "4400-102",
      notes: "Cliente de demonstração para habitação e saúde.",
    },
    {
      nif: "900000103",
      name: "Norte Digital, Lda.",
      email: "geral@nortedigital.demo",
      phone: "220000103",
      city: "Matosinhos",
      address: "Rua da Indústria, 55",
      postalCode: "4450-103",
      type: "BUSINESS" as const,
      cae: "62010",
      representativeName: "Rui Costa",
      notes: "Empresa de demonstração para Acidentes de Trabalho.",
    },
  ];

  const clients: any[] = [];
  for (const data of demoClients) {
    const client = await prisma.client.upsert({
      where: { companyId_nif: { companyId: company.id, nif: data.nif } },
      update: {},
      create: { ...data, companyId: company.id },
    });
    clients.push(client);
  }

  const [fidelidade, generali, allianz] = insurers;
  const [miguel, ana, empresa] = clients;

  const autoQuote = await prisma.quote.upsert({
    where: { companyId_reference: { companyId: company.id, reference: "DEMO-AUTO-001" } },
    update: {},
    create: {
      reference: "DEMO-AUTO-001",
      title: "Seguro Automóvel - Peugeot 3008",
      productType: "AUTO",
      status: "COMPARING",
      clientId: miguel.id,
      companyId: company.id,
      createdById: adminUser.id,
      effectiveDate: new Date(Date.now() + 14 * 86400000),
      riskData: {
        registration: "AA-00-AA",
        brand: "Peugeot",
        model: "3008 1.5 BlueHDi",
        year: "2021",
        usage: "Particular",
        annualKm: "15000",
        mainDriver: "Miguel Ferreira",
        claimsLast5Years: "0",
      },
      preferences: {
        coverage: "Danos próprios",
        deductiblePreference: "Até 500 EUR",
        roadsideAssistance: true,
        replacementVehicle: true,
      },
      notes: "Processo de demonstração com três propostas para comparação.",
      activities: { create: { companyId: company.id, action: "CREATED", description: "Cotação demo criada." } },
    },
  });

  const offerSeeds = [
    { insurerId: fidelidade.id, annualPremium: 492.4, commission: 63.2, deductible: 500, quoteNumber: "FID-DEMO-1001", recommended: false },
    { insurerId: generali.id, annualPremium: 448.9, commission: 68.5, deductible: 350, quoteNumber: "GEN-DEMO-1002", recommended: true },
    { insurerId: allianz.id, annualPremium: 469.75, commission: 61.1, deductible: 500, quoteNumber: "ALL-DEMO-1003", recommended: false },
  ];

  for (const offer of offerSeeds) {
    const exists = await prisma.quoteOffer.findFirst({ where: { quoteId: autoQuote.id, insurerId: offer.insurerId } });
    if (!exists) {
      await prisma.quoteOffer.create({
        data: {
          companyId: company.id,
          quoteId: autoQuote.id,
          ...offer,
          status: "RECEIVED",
          validUntil: new Date(Date.now() + 30 * 86400000),
          coverages: {
            civilLiability: "50.000.000 EUR",
            ownDamage: true,
            glass: "Sem franquia",
            roadsideAssistance: "Portugal e Europa",
            replacementVehicle: offer.insurerId === generali.id ? "30 dias" : "15 dias",
          },
        },
      });
    }
  }

  const homeQuote = await prisma.quote.upsert({
    where: { companyId_reference: { companyId: company.id, reference: "DEMO-HOME-001" } },
    update: {},
    create: {
      reference: "DEMO-HOME-001",
      title: "Multirriscos Habitação - Gaia",
      productType: "HOME",
      status: "QUOTING",
      clientId: ana.id,
      companyId: company.id,
      createdById: adminUser.id,
      riskData: {
        propertyType: "Apartamento",
        constructionYear: "2000",
        area: "145",
        buildingCapital: "185000",
        contentsCapital: "35000",
        use: "Habitação própria permanente",
      },
      preferences: { waterDamage: true, seismicRisk: true, familyLiability: true },
      offers: {
        create: [
          { companyId: company.id, insurerId: fidelidade.id, status: "REQUESTED" },
          { companyId: company.id, insurerId: allianz.id, status: "REQUESTED" },
        ],
      },
      activities: { create: { companyId: company.id, action: "CREATED", description: "Cotação de habitação demo criada." } },
    },
  });

  const workQuote = await prisma.quote.upsert({
    where: { companyId_reference: { companyId: company.id, reference: "DEMO-WORK-001" } },
    update: {},
    create: {
      reference: "DEMO-WORK-001",
      title: "Acidentes de Trabalho - Norte Digital",
      productType: "WORK_ACCIDENT",
      status: "DRAFT",
      clientId: empresa.id,
      companyId: company.id,
      createdById: adminUser.id,
      riskData: {
        activity: "Desenvolvimento de software",
        cae: "62010",
        employees: "8",
        annualPayroll: "178000",
        foreignWork: "Não",
        claimsHistory: "Sem sinistros nos últimos 5 anos",
      },
      activities: { create: { companyId: company.id, action: "CREATED", description: "Cotação de AT demo criada." } },
    },
  });

  const existingPolicy = await prisma.policy.findUnique({ where: { companyId_policyNumber: { companyId: company.id, policyNumber: "DEMO-POL-2026-001" } } });
  if (!existingPolicy) {
    const policy = await prisma.policy.create({
      data: {
        companyId: company.id,
        policyNumber: "DEMO-POL-2026-001",
        proposalNumber: "DEMO-PROP-001",
        product: "Multirriscos Habitação Plus",
        branch: "Habitação",
        premium: 238.5,
        commission: 35.78,
        startDate: new Date(Date.now() - 300 * 86400000),
        renewalDate: new Date(Date.now() + 35 * 86400000),
        paymentFrequency: PaymentFrequency.ANNUAL,
        status: PolicyStatus.ACTIVE,
        clientId: ana.id,
        insurerId: fidelidade.id,
        notes: "Apólice de demonstração para testar renovação, agenda e documentos.",
        documents: {
          create: [
            { companyId: company.id, name: "Condições particulares", type: "POLICY", url: "https://example.com/demo/condicoes-particulares.pdf" },
            { companyId: company.id, name: "Recibo anual", type: "RECEIPT", url: "https://example.com/demo/recibo.pdf" },
          ],
        },
      },
    });

    await prisma.calendarEvent.create({
      data: {
        title: `Preparar renovação ${policy.policyNumber}`,
        description: "Contactar cliente, rever capitais e pedir propostas alternativas.",
        type: "RENEWAL",
        priority: "HIGH",
        startAt: new Date(Date.now() + 20 * 86400000),
        allDay: true,
        companyId: company.id,
        createdById: adminUser.id,
        assignedToId: employeeUser.id,
        clientId: ana.id,
        policyId: policy.id,
        reminders: [15, 7, 1],
      },
    });
  }

  const demoPolicy = await prisma.policy.findUnique({
    where: { companyId_policyNumber: { companyId: company.id, policyNumber: "DEMO-POL-2026-001" } },
  });

  const claimSeeds = [
    {
      claimNumber: "SIN-DEMO-2026-001",
      clientId: ana.id,
      policyId: demoPolicy?.id ?? null,
      status: ClaimStatus.OPEN,
      description: "Danos por água na cozinha. Participação recebida, fotos anexadas pelo cliente e vistoria a agendar com a companhia.",
    },
    {
      claimNumber: "SIN-DEMO-2026-002",
      clientId: miguel.id,
      policyId: null,
      status: ClaimStatus.IN_PROGRESS,
      description: "Quebra isolada de vidros. A oficina está a aguardar autorização; confirmar franquia e disponibilidade do vidro.",
    },
    {
      claimNumber: "SIN-DEMO-2025-003",
      clientId: empresa.id,
      policyId: null,
      status: ClaimStatus.CLOSED,
      description: "Processo de acidentes de trabalho encerrado. Indemnização liquidada e documentação final arquivada.",
    },
  ];

  for (const claim of claimSeeds) {
    await prisma.claim.upsert({
      where: { companyId_claimNumber: { companyId: company.id, claimNumber: claim.claimNumber } },
      update: {},
      create: { companyId: company.id, ...claim },
    });
  }

  const meetingExists = await prisma.calendarEvent.findFirst({ where: { companyId: company.id, title: "Reunião de revisão de carteira - Miguel Ferreira" } });
  if (!meetingExists) {
    await prisma.calendarEvent.create({
      data: {
        title: "Reunião de revisão de carteira - Miguel Ferreira",
        description: "Rever automóvel, habitação e oportunidades de venda cruzada.",
        type: "MEETING",
        priority: "NORMAL",
        startAt: new Date(Date.now() + 5 * 86400000 + 10 * 3600000),
        endAt: new Date(Date.now() + 5 * 86400000 + 11 * 3600000),
        companyId: company.id,
        createdById: adminUser.id,
        assignedToId: employeeUser.id,
        clientId: miguel.id,
        quoteId: autoQuote.id,
        reminders: [1440, 60],
      },
    });
  }

  for (const insurer of insurers) {
    await prisma.organizationInsurer.upsert({
      where: { companyId_insurerId: { companyId: company.id, insurerId: insurer.id } },
      update: {},
      create: { companyId: company.id, insurerId: insurer.id, enabled: true },
    });
  }

  const secondOrganization = await prisma.company.upsert({
    where: { slug: "mediadora-demo-2" },
    update: { status: OrganizationStatus.ACTIVE },
    create: { name: "Mediadora Demonstração Norte", slug: "mediadora-demo-2", nif: "509000002", status: OrganizationStatus.ACTIVE, plan: "STARTER", maxUsers: 5, maxClients: 1000 },
  });
  await prisma.user.upsert({
    where: { email: "admin2@insureflow.pt" },
    update: { companyId: secondOrganization.id, role: UserRole.ADMIN, active: true },
    create: { name: "Administrador Mediadora 2", email: "admin2@insureflow.pt", password: testPassword, role: UserRole.ADMIN, companyId: secondOrganization.id },
  });
  await prisma.client.upsert({
    where: { companyId_nif: { companyId: secondOrganization.id, nif: "900000201" } },
    update: {},
    create: { companyId: secondOrganization.id, name: "Cliente Exclusivo Mediadora 2", nif: "900000201", email: "isolado@mediadora2.demo", city: "Braga" },
  });

  console.log("Dados de demonstração carregados:", {
    company: company.name,
    clients: clients.length,
    insurers: insurers.length,
    quotes: [autoQuote.reference, homeQuote.reference, workQuote.reference],
    users: [adminUser.email, employeeUser.email],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
