import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";

// Mock data da planilha - em produção, isso viria da Google Sheets API
const getSheetData = async () => {
  // Simulando dados da planilha (em produção, conectar com Google Sheets API)
  const sheetData = [
    { "Clientes Ativos": "PixRaspa", "Valor": "R$ 9.000,00", "Prioridade": "2", "Possibilidade de indicação": "Alta", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Dá P Fazer", "Traqueamento": "" },
    { "Clientes Ativos": "Karine", "Valor": "R$ 1.800,00", "Prioridade": "2", "Possibilidade de indicação": "Baixa", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Não da Zé", "Traqueamento": "" },
    { "Clientes Ativos": "Suprema poker", "Valor": "R$ 2.000,00", "Prioridade": "1", "Possibilidade de indicação": "Alta", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Não da Zé", "Traqueamento": "" },
    { "Clientes Ativos": "Mauro", "Valor": "R$ 5.000,00", "Prioridade": "1", "Possibilidade de indicação": "Alta", "Renovou": "s", "Renovação": "Midas", "Responsavel": "Dá P Fazer", "Traqueamento": "" },
    { "Clientes Ativos": "Diego", "Valor": "R$ 1.800,00", "Prioridade": "2", "Possibilidade de indicação": "Alta", "Renovou": "n", "Renovação": "Ronaldo", "Responsavel": "Não da Zé", "Traqueamento": "" },
    { "Clientes Ativos": "ECL", "Valor": "R$ 2.200,00", "Prioridade": "1", "Possibilidade de indicação": "Baixa", "Renovou": "n", "Renovação": "Ronaldo", "Responsavel": "Não da Zé", "Traqueamento": "" },
    { "Clientes Ativos": "Patroa", "Valor": "R$ 1.500,00", "Prioridade": "0", "Possibilidade de indicação": "Alta", "Renovou": "s", "Renovação": "Ronaldo/Marcilon", "Responsavel": "Dá P Fazer", "Traqueamento": "" },
    { "Clientes Ativos": "Naira", "Valor": "R$ 0,00", "Prioridade": "1", "Possibilidade de indicação": "Baixa", "Renovou": "n", "Renovação": "Ronaldo/Marcilon", "Responsavel": "Dá P Fazer", "Traqueamento": "" },
    { "Clientes Ativos": "Nebula", "Valor": "R$ 2.800,00", "Prioridade": "0", "Possibilidade de indicação": "Baixa", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Não da Zé", "Traqueamento": "" },
    { "Clientes Ativos": "Tamo na sorte", "Valor": "R$ 2.000,00", "Prioridade": "1", "Possibilidade de indicação": "Baixa", "Renovou": "n", "Renovação": "Ronaldo", "Responsavel": "Dá P Fazer", "Traqueamento": "" },
    { "Clientes Ativos": "Z9 bet", "Valor": "R$ 1.800,00", "Prioridade": "2", "Possibilidade de indicação": "Alta", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Dá P Fazer", "Traqueamento": "" },
    { "Clientes Ativos": "Aragão", "Valor": "R$ 1.600,00", "Prioridade": "2", "Possibilidade de indicação": "Alta", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Não da Zé", "Traqueamento": "" },
    { "Clientes Ativos": "Erica", "Valor": "R$ 750,00", "Prioridade": "Baixa", "Possibilidade de indicação": "n", "Renovou": "Ronaldo", "Renovação": "Não da Zé", "Responsavel": "", "Traqueamento": "" },
    { "Clientes Ativos": "Saul", "Valor": "R$ 2.800,00", "Prioridade": "1", "Possibilidade de indicação": "Baixa", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Dá P Fazer", "Traqueamento": "" },
    { "Clientes Ativos": "Alan", "Valor": "R$ 1.000,00", "Prioridade": "1", "Possibilidade de indicação": "Baixa", "Renovou": "n", "Renovação": "Ronaldo", "Responsavel": "Dá P Fazer", "Traqueamento": "PMEDT" },
    { "Clientes Ativos": "Manoel", "Valor": "R$ 2.000,00", "Prioridade": "2", "Possibilidade de indicação": "Baixa", "Renovou": "s", "Renovação": "Ronaldo", "Responsavel": "Dá P Fazer", "Traqueamento": "ONBOARDING" },
    { "Clientes Ativos": "joão pacheco", "Valor": "R$ 2.500,00", "Prioridade": "0", "Possibilidade de indicação": "Alta", "Renovou": "Ronaldo", "Renovação": "Dá P Fazer", "Responsavel": "Lucas", "Traqueamento": "4500" },
    { "Clientes Ativos": "Rafael Rasp", "Valor": "R$ 2.000,00", "Prioridade": "Ronaldo", "Possibilidade de indicação": "Dá P Fazer", "Renovou": "Marcilon", "Renovação": "12800", "Responsavel": "0", "Traqueamento": "14,52%" },
    // NOVO CLIENTE PARA TESTE
    { "Clientes Ativos": "Novo Cliente Teste", "Valor": "R$ 3.000,00", "Prioridade": "1", "Possibilidade de indicação": "Alta", "Renovou": "n", "Renovação": "Sistema", "Responsavel": "Auto Sync", "Traqueamento": "Sincronizado automaticamente" }
  ];

  return sheetData;
};

function parseCurrency(value: string): number {
  return parseInt(value.replace(/[R$.]/g, '').replace(',', ''));
}

function parsePriority(value: string | number): number {
  if (typeof value === 'number') return value;
  switch (value.toLowerCase()) {
    case 'baixa': return 0;
    case 'média': return 1;
    case 'alta': return 2;
    default: return 2; // Default to high
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    console.log("🔄 Iniciando sincronização automática com planilha...");
    
    // Buscar dados da planilha
    const sheetData = await getSheetData();
    
    let importedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const row of sheetData) {
      try {
        const clientName = row["Clientes Ativos"];
        if (!clientName) continue;

        const contractValue = parseCurrency(row["Valor"]);
        const priority = parsePriority(row["Prioridade"]);
        const referralPotential = row["Possibilidade de indicação"] === 'Alta' ? 'Alta' : 'Baixa';
        const renewed = row["Renovou"] === 's';

        // Handle data inconsistencies in the sheet for 'Renovação' and 'Responsavel'
        let renewalResponsible = '';
        let responsible = '';
        let tracking = '';

        if (clientName === "Erica") {
          responsible = row["Renovou"]; // "Ronaldo"
          renewalResponsible = row["Renovação"]; // "Não da Zé"
          tracking = row["Responsavel"]; // ""
        } else if (clientName === "joão pacheco") {
          responsible = row["Renovou"]; // "Ronaldo"
          renewalResponsible = row["Renovação"]; // "Dá P Fazer"
          tracking = row["Responsavel"]; // "Lucas"
        } else if (clientName === "Rafael Rasp") {
          responsible = row["Prioridade"]; // "Ronaldo"
          renewalResponsible = row["Possibilidade de indicação"]; // "Dá P Fazer"
          tracking = row["Renovou"]; // "Marcilon"
        } else {
          responsible = row["Renovação"];
          renewalResponsible = row["Responsavel"];
          tracking = row["Traqueamento"];
        }

        const clientData = {
          name: clientName,
          email: `${clientName.toLowerCase().replace(/\s/g, '')}@example.com`,
          contractValue,
          responsible,
          priority,
          referralPotential,
          renewed,
          renewalResponsible,
          tracking,
          status: 'not_started',
          statusComments: [{ status: 'not_started', comment: 'Sincronizado automaticamente da planilha', updatedBy: 'Auto Sync' }],
        };

        // Verificar se cliente já existe
        const existingClient = await Client.findOne({ name: clientName });

        if (existingClient) {
          // Atualizar cliente existente
          const updatedClient = await Client.findByIdAndUpdate(
            existingClient._id,
            { $set: clientData },
            { new: true }
          );
          updatedCount++;
          results.push({
            action: 'updated',
            name: clientName,
            changes: Object.keys(clientData)
          });
        } else {
          // Criar novo cliente
          const newClient = new Client(clientData);
          await newClient.save();
          importedCount++;
          results.push({
            action: 'created',
            name: clientName,
            id: newClient._id
          });
        }
      } catch (innerError) {
        console.error(`Error processing row for client ${row["Clientes Ativos"]}:`, innerError);
        errorCount++;
        results.push({ 
          action: 'error', 
          name: row["Clientes Ativos"], 
          error: innerError instanceof Error ? innerError.message : String(innerError) 
        });
      }
    }

    console.log(`✅ Sincronização concluída: ${importedCount} novos, ${updatedCount} atualizados, ${errorCount} erros`);

    return NextResponse.json({
      ok: true,
      message: "Sincronização automática concluída",
      summary: { 
        total: sheetData.length, 
        imported: importedCount, 
        updated: updatedCount, 
        errors: errorCount 
      },
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Sync sheet API error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
