using System;
using System.Collections.Generic;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Core.Services;

public static class TechnicianToolCatalog
{
    public static IReadOnlyList<TechnicianTool> GetTools() => new List<TechnicianTool>
    {
        new(
            "rustdesk",
            "RustDesk",
            "Acesso Remoto",
            "Software de desktop remoto open-source e seguro para conexão remota entre o técnico TweakLab e o cliente.",
            "https://rustdesk.com",
            "https://rustdesk.com/download",
            "Essencial para iniciar a sessão de assistência remota com baixa latência e segurança ponta-a-ponta.",
            "Remote"
        ),
        new(
            "hwinfo",
            "HWiNFO64",
            "Telemetria & Sensores",
            "Monitoramento detalhado de hardware em tempo real: sensores de VRM, temperaturas hotspot, tensões e throttles.",
            "https://www.hwinfo.com",
            "https://www.hwinfo.com/download/",
            "Auditoria de temperaturas, detecção de thermal throttling da CPU/GPU e saúde de tensões da fonte.",
            "Gauge"
        ),
        new(
            "cpuz",
            "CPU-Z",
            "Diagnóstico de Hardware",
            "Identificação precisa de microarquitetura da CPU, frequências de núcleos, latências e perfis XMP/EXPO de RAM.",
            "https://www.cpuid.com/softwares/cpu-z.html",
            "https://www.cpuid.com/downloads/cpu-z/cpu-z_2.11-en.exe",
            "Verificar se o perfil XMP/EXPO está ativo e as configurações de canal duplo/quad da memória.",
            "Cpu"
        ),
        new(
            "gpuz",
            "GPU-Z",
            "Diagnóstico de Hardware",
            "Informações aprofundadas da GPU, link PCIe (Gen4/Gen5 x16), VBIOS, clocks de memória e barramentos.",
            "https://www.techpowerup.com/gpuz/",
            "https://www.techpowerup.com/download/techpowerup-gpu-z/",
            "Validar se a placa de vídeo está rodando na largura de banda PCIe correta (ex: x16 ao invés de x1).",
            "Gpu"
        ),
        new(
            "crystaldiskinfo",
            "CrystalDiskInfo",
            "Armazenamento & S.M.A.R.T.",
            "Leitura de saúde de SSDs e HDDs (NVMe/SATA), setores realocados, total de TBW gravados e temperatura.",
            "https://crystalmark.info",
            "https://crystalmark.info/en/software/crystaldiskinfo/",
            "Descartar congelamentos e quedas repentinas provocadas por setores corrompidos ou degradação de SSD.",
            "Disk"
        ),
        new(
            "windbg",
            "WinDbg Preview",
            "Crash Dump & Blue Screen",
            "Depurador oficial da Microsoft para inspecionar arquivos Memory.dmp e Minidumps de telas azuis (BSOD).",
            "https://learn.microsoft.com/pt-br/windows-hardware/drivers/debugger/",
            "https://aka.ms/windbg/download",
            "Rastrear exatamente qual driver de terceiro provocou a tela azul (PAGE_FAULT, IRQL_NOT_LESS_OR_EQUAL).",
            "Bug"
        ),
        new(
            "capframex",
            "CapFrameX",
            "Benchmark & Frametimes",
            "Ferramenta de captura e análise de frametime e stuttering de jogos com base no PresentMon.",
            "https://www.capframex.com",
            "https://github.com/DevTechProfile/CapFrameX/releases",
            "Medição milissegundo a milissegundo de fluidez, 1% low e consistência de quadros antes e depois.",
            "Activity"
        ),
        new(
            "presentmon",
            "Intel PresentMon",
            "Benchmark & Frametimes",
            "Métricas modernas de GPU Busy, frame pacing e sobrecarga de CPU vs GPU em tempo real.",
            "https://game.intel.com/story/intel-presentmon/",
            "https://game.intel.com/story/intel-presentmon/",
            "Identificar gargalo real entre CPU e GPU e calcular a métrica de GPU Busy.",
            "Activity"
        ),
        new(
            "msiafterburner",
            "MSI Afterburner",
            "Monitoramento & GPU",
            "Utilitário padrão da indústria para monitoramento de placa de vídeo, curvas de ventoinha e undervolting.",
            "https://www.msi.com/Landing/afterburner/graphics-cards",
            "https://www.msi.com/Landing/afterburner/graphics-cards",
            "Ajuste fino de voltagem/frequência (undervolt seguro) e monitoramento in-game.",
            "Zap"
        ),
        new(
            "rtss",
            "RivaTuner Statistics Server (RTSS)",
            "Frame Pacing & Overlay",
            "Servidor de estatísticas de alta precisão para cap de FPS com frametimes estáveis e overlay no jogo.",
            "https://www.guru3d.com/download/rtss-rivatuner-statistics-server-download/",
            "https://www.guru3d.com/download/rtss-rivatuner-statistics-server-download/",
            "Estabilização de frametimes limitando a taxa de quadros e exibindo telemetria na tela.",
            "Sliders"
        ),
        new(
            "ddu",
            "Display Driver Uninstaller (DDU)",
            "Limpeza de Drivers",
            "Remoção cirúrgica de drivers da NVIDIA, AMD e Intel em Modo de Segurança sem deixar sobras no Registro.",
            "https://www.wagnardsoft.com",
            "https://www.wagnardsoft.com/display-driver-uninstaller-ddu-",
            "Indispensável para resolver travamentos de drivers de vídeo corrompidos ou após troca de GPU.",
            "Trash"
        ),
        new(
            "occt",
            "OCCT",
            "Estresse & Estabilidade",
            "Suite de testes de estresse para CPU, Memória RAM (AVX2), GPU e teste de trilhas de alimentação da Fonte.",
            "https://www.ocbase.com",
            "https://www.ocbase.com/download",
            "Validar se erros são causados por instabilidade física de memória, aquecimento ou defeito na fonte.",
            "Flame"
        ),
        new(
            "wiztree",
            "WizTree",
            "Armazenamento & Limpeza",
            "Leitor de MFT de altíssima velocidade para encontrar arquivos gigantes, lixos residuais e logs ocultos.",
            "https://diskanalyzer.com",
            "https://diskanalyzer.com/download",
            "Liberar dezenas de gigabytes de arquivos temporários e caches esquecidos em segundos.",
            "Folder"
        ),
        new(
            "7zip",
            "7-Zip",
            "Utilitários do Sistema",
            "Compactador e descompactador de arquivos de alta eficiência, essencial para logs e pacotes de drivers.",
            "https://www.7-zip.org",
            "https://www.7-zip.org/download.html",
            "Descompactação limpa de drivers, pacotes de ferramentas e logs brutos de testes.",
            "Archive"
        )
    };
}
