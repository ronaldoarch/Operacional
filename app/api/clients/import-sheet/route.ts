import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";

// Dados da planilha (você pode integrar com Google Sheets API depois)
const sheetData = [
  { name: "PixRaspa", contractValue: 9000, priority: 2, referralPotential: "Alta", renewed: true, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" },
  { name: "Karine", contractValue: 1800, priority: 2, referralPotential: "Baixa", renewed: true, renewalResponsible: "Ronaldo", tracking: "Não da Zé" },
  { name: "Suprema poker", contractValue: 2000, priority: 1, referralPotential: "Alta", renewed: true, renewalResponsible: "Ronaldo", tracking: "Não da Zé" },
  { name: "Mauro", contractValue: 5000, priority: 1, referralPotential: "Alta", renewed: true, renewalResponsible: "Midas", tracking: "Dá P Fazer" },
  { name: "Diego", contractValue: 1800, priority: 2, referralPotential: "Alta", renewed: false, renewalResponsible: "Ronaldo", tracking: "Não da Zé" },
  { name: "ECL", contractValue: 2200, priority: 1, referralPotential: "Baixa", renewed: false, renewalResponsible: "Ronaldo", tracking: "Não da Zé" },
  { name: "Patroa", contractValue: 1500, priority: 0, referralPotential: "Alta", renewed: true, renewalResponsible: "Ronaldo/Marcilon", tracking: "Dá P Fazer" },
  { name: "Naira", contractValue: 0, priority: 1, referralPotential: "Baixa", renewed: false, renewalResponsible: "Ronaldo/Marcilon", tracking: "Dá P Fazer" },
  { name: "Nebula", contractValue: 2800, priority: 0, referralPotential: "Baixa", renewed: true, renewalResponsible: "Ronaldo", tracking: "Não da Zé" },
  { name: "Tamo na sorte", contractValue: 2000, priority: 1, referralPotential: "Baixa", renewed: false, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" },
  { name: "Z9 bet", contractValue: 1800, priority: 2, referralPotential: "Alta", renewed: true, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" },
  { name: "Aragão", contractValue: 1600, priority: 2, referralPotential: "Alta", renewed: true, renewalResponsible: "Ronaldo", tracking: "Não da Zé" },
  { name: "Erica", contractValue: 750, priority: 0, referralPotential: "Baixa", renewed: false, renewalResponsible: "Ronaldo", tracking: "Não da Zé" },
  { name: "Saul", contractValue: 2800, priority: 1, referralPotential: "Baixa", renewed: true, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" },
  { name: "Alan", contractValue: 1000, priority: 1, referralPotential: "Baixa", renewed: false, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" },
  { name: "Manoel", contractValue: 2000, priority: 2, referralPotential: "Baixa", renewed: true, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" },
  { name: "joão pacheco", contractValue: 2500, priority: 0, referralPotential: "Alta", renewed: true, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" },
  { name: "Rafael Rasp", contractValue: 2000, priority: 2, referralPotential: "Alta", renewed: true, renewalResponsible: "Ronaldo", tracking: "Dá P Fazer" }
];

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    let importedCount = 0;
    let updatedCount = 0;
    const results = [];

    for (const clientData of sheetData) {
      try {
        // Buscar cliente existente pelo nome exato
        let existingClient = await Client.findOne({ 
          name: clientData.name 
        });

        const updateData = {
          contractValue: Math.round(clientData.contractValue * 100), // Converter para centavos
          priority: clientData.priority,
          referralPotential: clientData.referralPotential,
          renewed: clientData.renewed,
          renewalResponsible: clientData.renewalResponsible,
          tracking: clientData.tracking,
          responsible: clientData.renewalResponsible,
          email: `${clientData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          company: clientData.name,
          niche: 'casino' // Padrão baseado na planilha
        };

        if (existingClient) {
          console.log(`Updating client ${clientData.name} with data:`, updateData);
          // Atualizar cliente existente
          const updatedClient = await Client.findByIdAndUpdate(
            existingClient._id,
            updateData,
            { new: true }
          );
          console.log(`Updated client result:`, updatedClient);
          updatedCount++;
          results.push({
            action: 'updated',
            name: clientData.name,
            id: updatedClient?._id || existingClient._id
          });
        } else {
          // Criar novo cliente
          const newClient = new Client({
            name: clientData.name,
            ...updateData
          });
          await newClient.save();
          importedCount++;
          results.push({
            action: 'created',
            name: clientData.name,
            id: newClient._id
          });
        }
      } catch (error) {
        console.error(`Error processing client ${clientData.name}:`, error);
        results.push({
          action: 'error',
          name: clientData.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        total: sheetData.length,
        imported: importedCount,
        updated: updatedCount,
        errors: results.filter(r => r.action === 'error').length
      },
      results
    });
  } catch (error) {
    console.error("Import sheet error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
