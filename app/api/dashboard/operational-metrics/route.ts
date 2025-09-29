import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Buscar todos os clientes
    const clients = await Client.find({});
    
    console.log(`Found ${clients.length} clients`);
    
    // Calcular métricas operacionais
    const metrics = {
      // Métricas de Status/Tracking
      pmt: clients.filter(c => c.tracking === 'PMT').length,
      pmedt: clients.filter(c => c.tracking === 'PMEDT').length,
      pb: clients.filter(c => c.tracking === 'PB').length,
      onboarding: clients.filter(c => c.tracking === 'ONBOARDING').length,
      
      // Métricas de Renovação
      renewed: clients.filter(c => c.renewed === true).length,
      notRenewed: clients.filter(c => c.renewed === false).length,
      
      // Métricas Financeiras
      totalContractValue: clients.reduce((sum, c) => sum + (c.contractValue || 0), 0),
      totalClients: clients.length,
      
      // Calcular MMR (Monthly Recurring Revenue) - assumindo que é o total de contratos
      mmr: clients.reduce((sum, c) => sum + (c.contractValue || 0), 0),
      
      // Calcular Taxa de Churn (clientes não renovados / total)
      churnRate: clients.length > 0 ? 
        (clients.filter(c => c.renewed === false).length / clients.length) * 100 : 0,
      
      // Métricas por Responsável
      byResponsible: calculateByResponsible(clients)
    };
    
    console.log('Metrics calculated successfully');
    
    return NextResponse.json({
      ok: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Operational metrics API error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateByResponsible(clients: any[]) {
  try {
    const responsibleMap = new Map();
    
    clients.forEach(client => {
      const responsible = client.responsible || 'Não Definido';
      const contractValue = client.contractValue || 0;
      
      if (!responsibleMap.has(responsible)) {
        responsibleMap.set(responsible, {
          responsible,
          revenue: 0,
          cost: 0,
          clientCount: 0,
          contracts: []
        });
      }
      
      const data = responsibleMap.get(responsible);
      data.revenue += contractValue;
      data.clientCount += 1;
      data.contracts.push({
        clientName: client.name || 'Nome não definido',
        value: contractValue,
        status: client.status || 'not_started',
        renewed: client.renewed || false
      });
    });
    
    // Converter para array e calcular percentuais
    const result = Array.from(responsibleMap.values()).map(data => {
      const totalRevenue = clients.reduce((sum, c) => sum + (c.contractValue || 0), 0);
      const revenuePercentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
      
      // Calcular custo baseado em regras de negócio (exemplo: 10% da receita)
      const cost = data.revenue * 0.1; // 10% de custo sobre a receita
      const costPercentage = data.revenue > 0 ? (cost / data.revenue) * 100 : 0;
      
      return {
        responsible: data.responsible,
        revenue: data.revenue,
        cost: Math.round(cost),
        clientCount: data.clientCount,
        revenuePercentage: Math.round(revenuePercentage * 100) / 100,
        costPercentage: Math.round(costPercentage * 100) / 100,
        contracts: data.contracts
      };
    });
    
    // Ordenar por receita (maior primeiro)
    return result.sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.error("Error in calculateByResponsible:", error);
    return [];
  }
}
